import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApprovalProducts } from './approval-product.entity';
import { Units } from './unit.entity';
import { LessonStatus } from '@common/constants/lesson.enum';
import { EvaluationPromptType } from '@modules/lesson/types/evaluation.type';
import { FeedbackEvaluationPrompt } from '@modules/lesson/types/feedback.type';

interface LessonHistory {
  answer: { originalText: string; revisedText: string };
  answerSuggestion: {
    originalSentence: string;
    originalWord: string;
    suggest: string;
  };
  answerEvaluation: EvaluationPromptType;
  evaluation: {
    content: number;
    tone: number;
    grammar: number;
    punctuation: number;
    choice: number;
    fluency: number;
    organization: number;
    averageTotals: number;
    feedBack: FeedbackEvaluationPrompt;
  };
}

export type LessonDocument = HydratedDocument<Lessons>;

@CustomEntity(Lessons.name)
export class Lessons {
  @Prop({ type: Types.ObjectId, ref: ApprovalProducts.name, index: true })
  approvalProduct: ApprovalProducts | Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Units.name, index: true })
  unit: Units | Types.ObjectId | string;

  @Prop({ type: Date, required: false, default: new Date(), index: true })
  startDate?: Date;

  @Prop({ type: Date, index: true })
  endDate: Date;

  @Prop({
    type: String,
    required: false,
    default: LessonStatus.NOT_STARTED,
    enum: LessonStatus,
    index: true,
  })
  status?: LessonStatus;

  @Prop({ type: Object, required: false, default: null })
  history?: LessonHistory;

  @Prop({ type: Date, required: false, default: null })
  dateSubmit?: Date;

  @Prop({ type: Number, required: false, default: 0 })
  time?: number;

  @Prop({ type: String, required: false, default: null })
  title?: string;

  @Prop({ type: String, required: false, default: null })
  writing?: string;

  @Prop({ type: String, required: false, default: null })
  selfEditing?: string;

  @Prop({ type: Boolean, required: false, default: false })
  isLearnAgain?: boolean;

  @Prop({ type: String, required: false, default: null, index: true })
  artwork?: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lessons);
