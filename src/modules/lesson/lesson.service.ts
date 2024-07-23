import { ApprovalProducts } from '@common/models/entities/approval-product.entity';
import { Lessons } from '@common/models/entities/lesson.entity';
import { Units } from '@common/models/entities/unit.entity';
import { ICurrentUser } from '@common/types/current-user.type';
import {
  FilterAggregate,
  JoinAggregate,
  PaginateAggregate,
  PopulateAggregate,
} from '@common/utils/db.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, Model, PipelineStage, Types } from 'mongoose';
import {
  FilterLessonStudentDto,
  QueryArtworksDto,
} from './dtos/filter-lesson.dto';
import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { Products } from '@common/models/entities/product.entity';
import {
  LessonStatus,
  LessonStatusStep,
  LessonStatusUpdate,
} from '@common/constants/lesson.enum';
import { PromptTemplate } from '@langchain/core/prompts';
import { BufferMemory } from 'langchain/memory';
import { OpenAI } from '@langchain/openai';
import { appSettings } from '@common/configs/appSetting';
import { Caching } from '@common/providers/caching/caching';
import { LLMChain, ConversationChain } from 'langchain/chains';
import { GptService } from '@modules/gpt/gpt.service';
import { ChatHistory } from '@common/models/entities/chat-history.entity';
import {
  UpdateLessonSelfEditingDto,
  UpdateLessonWritingDto,
} from './dtos/update-lesson.dto';
import { chatbotPrompt } from './prompt/chatbot.prompt';
import { definePrompt } from './prompt/define.prompt';
import { evaluationPrompt } from './prompt/evaluation.prompt';
import { questionPrompt } from './prompt/question.prompt';
import { EvaluationPromptType } from './types/evaluation.type';
import { FeedbackEvaluationPrompt } from './types/feedback.type';
import { Points } from '@common/models/entities/point.entity';
import { FileService } from '@modules/file/file.service';

@Injectable()
export class LessonService {
  private llm: OpenAI = new OpenAI({
    openAIApiKey: appSettings.openAI.key6,
    modelName: 'gpt-4o',
    temperature: 0.7,
    verbose: false,
  });

  constructor(
    @InjectModel(Lessons.name) private lessonModel: Model<Lessons>,
    @InjectModel(Units.name) private unitModel: Model<Units>,
    @InjectModel(ApprovalProducts.name)
    private approvalProductModel: Model<ApprovalProducts>,
    @InjectModel(ChatHistory.name)
    private chatHistoryModel: Model<ChatHistory>,
    @InjectModel(Points.name)
    private pointModel: Model<Points>,
    private caching: Caching,
    private gptService: GptService,
    private fileService: FileService,
  ) {}

  async createForStudent(approval: ApprovalProducts) {
    const units = await this.unitModel
      .find({
        course: approval.course['_id'],
      })
      .sort({
        unit: 1,
      });

    const bulkWrite = [] as AnyBulkWriteOperation<Lessons>[];

    units.forEach((unit) => {
      bulkWrite.push({
        insertOne: {
          document: {
            approvalProduct: approval['_id'],
            unit: unit._id,
            endDate: new Date(new Date().setDate(new Date().getDay() + 105)),
          },
        },
      });
    });

    await this.lessonModel.bulkWrite(bulkWrite);
    return 'Lessons created successfully';
  }

  async getForStudent(user: ICurrentUser, query: FilterLessonStudentDto) {
    const { limit, page, search } = query;

    const pipeline = [
      ...FilterAggregate({
        'student._id': user._id,
        status: ApprovalProductStatus.ACCEPTED,
      }),
      ...PopulateAggregate({
        from: Products.name,
        foreignField: 'course.product',
        pipeline: [
          {
            $lookup: {
              from: 'levels',
              localField: 'level',
              foreignField: '_id',
              as: 'level',
            },
          },
          {
            $unwind: '$level',
          },
          {
            $project: {
              level: 1,
            },
          },
        ],
      }),
      {
        $project: {
          startDate: 1,
          endDate: 1,
          course: {
            name: 1,
            product: 1,
          },
        },
      },
      {
        $sort: {
          'course.name': 1,
        },
      },
    ] as PipelineStage[];

    pipeline.push(
      JoinAggregate({
        from: Lessons.name,
        foreignField: 'approvalProduct',
        as: Lessons.name,
        pipeline: [
          {
            $match: {
              isLearnAgain: false,
            },
          },
          {
            $lookup: {
              from: 'units',
              localField: 'unit',
              foreignField: '_id',
              as: 'unit',
            },
          },
          {
            $unwind: '$unit',
          },
          {
            $project: {
              unit: {
                unit: 1,
                topic: 1,
              },
              startDate: 1,
              endDate: 1,
              status: 1,
            },
          },
          {
            $sort: {
              'unit.unit': 1,
            },
          },
        ],
      }),
    );

    const lessons = await PaginateAggregate(
      this.approvalProductModel,
      {
        limit,
        page,
      },
      pipeline,
    );

    return lessons;
  }

  async getDetailForStudent(lessonId: string, user: ICurrentUser) {
    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate([
        {
          path: 'unit',
          populate: {
            path: 'course',
            populate: {
              path: 'product',
              populate: 'level',
            },
          },
        },
      ])
      .select('-approvalProduct');

    if (lesson.status === LessonStatus.NOT_STARTED) {
      lesson.status = LessonStatus.BRAIN_STORING;
      await Promise.all([
        this.caching.clearCacheLessonStudent(user._id.toString()),
        lesson.save(),
      ]);
    }

    return lesson;
  }

  async chatbotLesson(lessonId: string, question: string, user: ICurrentUser) {
    const lesson = await this.lessonModel.findById(lessonId).populate('unit');

    if (!lesson) throw new BadRequestException('Lesson not found');

    const unit = lesson.unit as Units;

    const formatPrompt = await PromptTemplate.fromTemplate(
      chatbotPrompt,
    ).format({
      topic: unit.topic,
      username: user.username,
      vocabulary: unit.vocabulary,
    });

    const memory = new BufferMemory({ memoryKey: 'chat_history' });
    let storeMemory = [];
    const key = `memory:${user._id.toString()}:${lesson._id.toString()}`;
    storeMemory = await this.caching.getValue(key);
    if (storeMemory)
      storeMemory.forEach((m) => {
        memory.saveContext({ input: m.question }, { output: m.answer });
      });
    else storeMemory = [];

    const prompt = new PromptTemplate({
      template: formatPrompt,
      inputVariables: ['chat_history', 'human_input'],
    });

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      memory,
    });

    const answer = await chain.predict({
      human_input: question,
    });

    const audioUrl = await this.gptService.textToSpeech(answer);

    storeMemory.push({ question, answer });
    this.caching.setValue(key, storeMemory, 20 * 60 * 1000);

    const history = `${user.username}: ${question}\nAI: ${answer}\ntime: ${new Date().toISOString()}`;
    const chatHistory = await this.chatHistoryModel.findOne({
      student: user._id,
      lesson: lesson._id,
    });

    if (chatHistory) {
      await chatHistory.updateOne({
        $push: {
          history,
        },
      });
    } else {
      await this.chatHistoryModel.create({
        student: user._id,
        lesson: lesson._id,
        history: [history],
      });
    }

    return { answer, audioUrl };
  }

  async chatbotLessonImages(
    lessonId: string,
    question: string,
    images: number,
    user: ICurrentUser,
  ) {
    const lesson = await this.lessonModel.findById(lessonId).populate('unit');

    if (!lesson) throw new BadRequestException('Lesson not found');

    const unit = lesson.unit as Units;

    const formatPrompt = await PromptTemplate.fromTemplate(
      chatbotPrompt,
    ).format({
      topic: unit.topic,
      username: user.username,
      vocabulary: unit.vocabulary,
    });

    const memory = new BufferMemory({ memoryKey: 'chat_history' });
    let storeMemory = [];
    const key = `memory:${user._id.toString()}:${lesson._id.toString()}`;
    storeMemory = await this.caching.getValue(key);
    if (storeMemory)
      storeMemory.forEach((m) => {
        memory.saveContext({ input: m.question }, { output: m.answer });
      });
    else storeMemory = [];

    const prompt = new PromptTemplate({
      template: formatPrompt,
      inputVariables: ['chat_history', 'human_input'],
    });

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      memory,
    });

    const answer = await chain.predict({
      human_input: question,
    });

    const history = `${user.username}: ${question}\nAI: ${answer}\ntime: ${new Date().toISOString()}`;
    storeMemory.push({ question, answer });

    const [audioUrl, chatHistory, genImages, cache] = await Promise.all([
      this.gptService.textToSpeech(answer),
      this.chatHistoryModel.findOne({
        student: user._id,
        lesson: lesson._id,
      }),
      this.gptService.generateImagesByChatbot(answer, images),
      this.caching.setValue(key, storeMemory, 20 * 60 * 1000),
    ]);

    if (chatHistory) {
      await chatHistory.updateOne({
        $push: {
          history,
        },
      });
    } else {
      await this.chatHistoryModel.create({
        student: user._id,
        lesson: lesson._id,
        history: [history],
      });
    }

    return { answer, audioUrl, images: genImages };
  }

  async updateLessonWriting(
    lessonId: string,
    body: UpdateLessonWritingDto,
    user: ICurrentUser,
  ) {
    const lesson = await this.lessonModel.findById(lessonId).populate('unit');

    if (!lesson) throw new BadRequestException('lesson not found');
    const unit = lesson.unit as Units;

    lesson.status = LessonStatus.WRITING;
    lesson.title = body.title;
    lesson.writing = body.writing;
    lesson.time = body.timeWriting;

    if (body.save) {
      await Promise.all([
        this.caching.clearCacheLessonStudent(user._id.toString()),
        lesson.save(),
      ]);
      return lesson.toObject();
    }

    lesson.dateSubmit = new Date();

    const prompt = await Promise.all([
      new PromptTemplate({
        inputVariables: ['content', 'topic'],
        template: definePrompt,
      }).format({
        content: body.writing,
        topic: unit.topic,
      }),

      new PromptTemplate({
        inputVariables: [
          'gradeLevel',
          'topic',
          'genre',
          'grammar',
          'writingPoint',
          'content',
        ],
        template: questionPrompt,
      }).format({
        gradeLevel: unit.gradeLevel,
        topic: unit.topic,
        genre: unit.genre,
        grammar: unit.grammar,
        writingPoint: unit.writingPoint,
        content: body.writing,
      }),

      lesson.save(),
    ]);

    const conversation = new ConversationChain({
      llm: this.llm,
      verbose: false,
    });

    const answer = await conversation
      .predict({
        input: prompt[0],
      })
      .catch((err) => {
        console.error(err);

        throw new BadRequestException(
          'An error occurred while grading, please try again.',
        );
      });

    if (answer.includes('please rewrite'))
      throw new BadRequestException(
        answer.includes(`\"`) ? answer.replaceAll(`\"`, '') : answer,
      );

    const promptEvaluation = await new PromptTemplate({
      inputVariables: [
        'topic',
        'genre',
        'gradeLevel',
        'lexileRange',
        'grammar',
        'vocabulary',
        'textComplexity',
        'primarySentenceStructure',
        'writingPoint',
        'answer',
      ],
      template: evaluationPrompt,
    }).format({
      topic: unit.topic,
      genre: unit.genre,
      gradeLevel: unit.gradeLevel,
      lexileRange: unit.lexileRange,
      grammar: unit.grammar,
      vocabulary: unit.vocabulary,
      textComplexity: unit.textComplexity,
      primarySentenceStructure: unit.primarySentenceStructure,
      writingPoint: unit.writingPoint,
      answer,
    });

    const [answerSuggestion, answerEvaluation, historyPoint] =
      await Promise.all([
        conversation.predict({
          input: prompt[1],
        }),
        conversation.predict({
          input: promptEvaluation,
        }),
        this.pointModel.findOne({
          student: user._id,
          lesson: lesson._id,
        }),
      ]).catch((err) => {
        console.error(err);

        throw new BadRequestException(
          'An error occurred while grading, please try again.',
        );
      });

    try {
      const resultHandlePrompt = {
        answer: JSON.parse(answer),
        answerSuggestion: JSON.parse(answerSuggestion),
        answerEvaluation: JSON.parse(answerEvaluation) as EvaluationPromptType,
      };

      const evaluation = {
        content:
          3 - 0.5 * resultHandlePrompt.answerEvaluation['content'].length >= 0
            ? 3 - 0.5 * resultHandlePrompt.answerEvaluation['content'].length
            : 0,
        tone:
          3 - 0.5 * resultHandlePrompt.answerEvaluation['tone'].length >= 0
            ? 3 - 0.5 * resultHandlePrompt.answerEvaluation['tone'].length
            : 0,
        grammar:
          5 - 0.5 * resultHandlePrompt.answerEvaluation['grammar'].length >= 0
            ? 5 - 0.5 * resultHandlePrompt.answerEvaluation['grammar'].length
            : 0,
        punctuation:
          5 - 0.5 * resultHandlePrompt.answerEvaluation['punctuation'].length >=
          0
            ? 5 -
              0.5 * resultHandlePrompt.answerEvaluation['punctuation'].length
            : 0,
        choice:
          5 - 0.5 * resultHandlePrompt.answerEvaluation['wordChoice'].length >=
          0
            ? 5 - 0.5 * resultHandlePrompt.answerEvaluation['wordChoice'].length
            : 0,
        fluency:
          5 -
            0.5 *
              resultHandlePrompt.answerEvaluation['sentenceFluency'].length >=
          0
            ? 5 -
              0.5 *
                resultHandlePrompt.answerEvaluation['sentenceFluency'].length
            : 0,
        organization:
          4 -
            0.5 * resultHandlePrompt.answerEvaluation['organization'].length >=
          0
            ? 4 -
              0.5 * resultHandlePrompt.answerEvaluation['organization'].length
            : 0,
        averageTotals: 0,
        feedBack: 'A+' as FeedbackEvaluationPrompt,
      };

      Object.keys(evaluation).map((key) => {
        if (key === 'feedBack' || key === 'averageTotals') return;
        return (evaluation.averageTotals += evaluation[key]);
      });

      if (evaluation.averageTotals >= 0 && evaluation.averageTotals < 8)
        evaluation.feedBack = 'C';
      if (evaluation.averageTotals >= 8 && evaluation.averageTotals < 15)
        evaluation.feedBack = 'B';
      if (evaluation.averageTotals >= 15 && evaluation.averageTotals < 22)
        evaluation.feedBack = 'B+';
      if (evaluation.averageTotals >= 22 && evaluation.averageTotals < 29)
        evaluation.feedBack = 'A';
      if (evaluation.averageTotals >= 29 && evaluation.averageTotals <= 35)
        evaluation.feedBack = 'A+';

      lesson.status = LessonStatus.REVISING_COMPLETE;
      lesson.history = { ...resultHandlePrompt, evaluation };

      if (!historyPoint) {
        await Promise.all([
          this.pointModel.create({
            student: user._id,
            lesson: lesson._id,
            point: evaluation.averageTotals,
          }),
          lesson.save(),
          this.caching.clearCacheStudent(user._id.toString()),
        ]);
      } else {
        historyPoint.point = evaluation.averageTotals;
        await Promise.all([
          historyPoint.save(),
          lesson.save(),
          this.caching.clearCacheStudent(user._id.toString()),
        ]);
      }

      return {
        lesson,
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        'An error occurred while grading, please try again.',
      );
    }
  }

  async updateLessonSelfEditing(
    lessonId: string,
    body: UpdateLessonSelfEditingDto,
    user: ICurrentUser,
  ) {
    const { save, title, writing } = body;

    const lesson = await this.lessonModel.findById(lessonId);

    if (!lesson) throw new BadRequestException('Lesson not found');

    lesson.title = title;
    lesson.selfEditing = writing;
    lesson.status = LessonStatus.SELF_EDITING;

    if (save) {
      await lesson.save();
      return lesson;
    }

    lesson.status = LessonStatus.AlMOST_OVER;
    await lesson.save();
    return lesson;
  }

  async updateArtworkLesson(lessonId: string, file: Express.Multer.File) {
    const lesson = await this.lessonModel.findById(lessonId);

    if (!lesson) throw new BadRequestException('Lesson not found');

    const getLinkUpload = await this.fileService.uploadBufferImage(
      Date.now(),
      file.buffer,
    );

    lesson.artwork = getLinkUpload;
    lesson.status = LessonStatus.SAVED;

    await lesson.save();

    return lesson;
  }

  async getArtworkLesson(query: QueryArtworksDto, user: ICurrentUser) {
    const { page, limit, lessonIds } = query;

    const pipeline = [
      {
        $match: {
          artwork: { $ne: null },
        },
      },
    ] as PipelineStage[];

    pipeline.push(
      ...PopulateAggregate({
        from: 'approvalProducts',
        foreignField: 'approvalProduct',
        pipeline: [
          {
            $match: {
              'student._id': user._id,
            },
          },
        ],
      }),
      ...PopulateAggregate({
        from: 'units',
        foreignField: 'unit',
      }),
    );

    pipeline.push({
      $project: {
        artwork: 1,
        approvalProduct: {
          course: {
            name: 1,
          },
        },
        unit: {
          unit: 1,
        },
      },
    });

    if (lessonIds) pipeline[0]['$match']._id = { $in: lessonIds };

    const artworks = await PaginateAggregate(
      this.lessonModel,
      {
        limit,
        page,
      },
      pipeline,
    );

    return artworks;
  }

  async learnAgainForStudent(lessonId: string) {
    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate('approvalProduct');

    if (!lesson) throw new BadRequestException('Lesson not found');

    lesson.isLearnAgain = true;

    const approvalProduct = lesson.approvalProduct as ApprovalProducts;

    const [updateOldLesson, clearCache, createNewLesson] = await Promise.all([
      lesson.save(),
      this.caching.clearCacheStudent(approvalProduct.student['_id'].toString()),
      this.caching.clearCacheLessonDetail(lessonId),
      this.lessonModel.create({
        approvalProduct: lesson.approvalProduct,
        unit: lesson.unit,
        endDate: new Date(new Date().setDate(new Date().getDay() + 105)),
      }),
    ]);

    return createNewLesson;
  }

  async updateLessonStatus(
    lessonId: string,
    status: LessonStatusUpdate,
    user: ICurrentUser,
  ) {
    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate('approvalProduct');

    if (!lesson) throw new BadRequestException('Lesson not found');
    if (LessonStatusStep[status] >= LessonStatusStep[lesson.status])
      throw new BadRequestException(
        'Cannot update a state greater than the current state',
      );

    const approvalProduct = lesson.approvalProduct as ApprovalProducts;

    switch (status) {
      case LessonStatusUpdate.BRAIN_STORING:
        lesson.status = LessonStatus.BRAIN_STORING;
        lesson.history = null;
        lesson.selfEditing = null;
        lesson.dateSubmit = null;
        lesson.time = 0;
        lesson.artwork = null;
        await Promise.all([
          this.pointModel.deleteOne({
            student: user._id,
            lesson: lesson._id,
          }),
          this.chatHistoryModel.deleteOne({
            student: user._id,
            lesson: lesson._id,
          }),
        ]);
        break;

      case LessonStatusUpdate.WRITING:
        lesson.status = LessonStatus.WRITING;
        lesson.history = null;
        lesson.selfEditing = null;
        lesson.dateSubmit = null;
        lesson.time = 0;
        lesson.artwork = null;
        await this.pointModel.deleteOne({
          student: user._id,
          lesson: lesson._id,
        });
        break;

      case LessonStatusUpdate.REVISING_COMPLETE:
        lesson.status = LessonStatus.REVISING_COMPLETE;
        lesson.selfEditing = null;
        lesson.artwork = null;
        break;

      case LessonStatusUpdate.SELF_EDITING:
        lesson.status = LessonStatus.SELF_EDITING;
        lesson.artwork = null;
        break;

      case LessonStatusUpdate.AlMOST_OVER:
        lesson.status = LessonStatus.AlMOST_OVER;
        lesson.artwork = null;
        break;
    }

    await Promise.all([
      lesson.save(),
      this.caching.clearCacheStudent(approvalProduct.student['_id'].toString()),
      this.caching.clearCacheLessonDetail(lessonId),
    ]);

    return lesson;
  }
}
