import { Users } from '@common/models/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { hashing } from '@common/utils/hashing.util';
import { ICurrentUser } from '@common/types/current-user.type';
import { FilterStudentLmsDto, FilterUserDto } from './dtos/filter-user.dto';
import { UserRoles } from '@common/constants/role.enum';
import {
  FilterAggregate,
  FilterAndAggregate,
  JoinAggregate,
  PaginateAggregate,
  PaginateCustom,
  PopulateAggregate,
  SearchDB,
} from '@common/utils/db.util';
import { appSettings } from '@common/configs/appSetting';
import { Campus } from '@common/models/entities/campus.entity';
import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { UpdateProfileStudentDto } from './dtos/update-user.dto';
import { MyPet } from '@common/models/entities/my-pet.entity';
import { PointService } from '@modules/point/point.service';
import { Lessons } from '@common/models/entities/lesson.entity';
import { ApprovalProducts } from '@common/models/entities/approval-product.entity';
import { LessonStatus } from '@common/constants/lesson.enum';
import { Caching } from '@common/providers/caching/caching';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    @InjectModel(MyPet.name) private readonly myPetModel: Model<MyPet>,
    @InjectModel(Lessons.name)
    private readonly lessonModel: Model<Lessons>,
    private caching: Caching,
    private pointService: PointService,
  ) {}

  async findUser(email: string) {
    const user = await this.userModel
      .findOne({
        $or: [
          { email },
          {
            username: email,
          },
        ],
      })
      .populate('role campus country level');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel
      .findOne({
        $or: [
          { email },
          {
            username: email,
          },
        ],
      })
      .select('-password')
      .populate('role campus country level');

    if (!user) return null;

    return user.toObject();
  }

  async getProfile(user: ICurrentUser) {
    const [point, totalCourse, courseSaved] = await Promise.all([
      this.pointService.getPointForStudent(user),

      this.lessonModel.aggregate([
        {
          $lookup: {
            from: 'approvalProducts',
            localField: 'approvalProduct',
            foreignField: '_id',
            as: 'approvalProduct',
            pipeline: [
              {
                $match: {
                  status: ApprovalProductStatus.ACCEPTED,
                },
              },
            ],
          },
        },
        {
          $match: {
            'approvalProduct.student._id': user._id,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]),

      this.lessonModel.aggregate([
        {
          $lookup: {
            from: 'approvalProducts',
            localField: 'approvalProduct',
            foreignField: '_id',
            as: 'approvalProduct',
            pipeline: [
              {
                $match: {
                  status: ApprovalProductStatus.ACCEPTED,
                },
              },
            ],
          },
        },
        {
          $match: {
            'approvalProduct.student._id': user._id,
            status: LessonStatus.SAVED,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]),
    ]);

    return {
      point: point.point,
      course: `${courseSaved.length}/${totalCourse.length}`,
      user,
    };
  }

  async create(
    payload: CreateUserDto,
    role: Types.ObjectId,
    user: ICurrentUser,
  ) {
    const hashPass = await hashing(payload.password);

    if (user.role.name === UserRoles.CAMPUS_MANAGER) {
      payload.campus = user.campus['_id'];
      payload.country = user.country['_id'];
    }

    await Promise.all([
      this.checkEmail(payload.email),
      this.checkUsername(payload.username),
    ]);

    const newUser = await this.userModel.create({
      ...payload,
      role,
      password: hashPass,
    });

    await this.myPetModel.create({
      student: newUser._id,
    });

    return newUser;
  }

  async updateProfileStudent(
    payload: UpdateProfileStudentDto,
    studentId: string,
  ) {
    if (payload.password) payload.password = await hashing(payload.password);

    const user = await this.userModel.findByIdAndUpdate(studentId, payload, {
      new: true,
    });

    return user;
  }

  async getStudents(user: ICurrentUser, query: FilterUserDto) {
    const { limit, page, search, campus, country } = query;

    const filter = {
      $and: [
        {
          role: {
            $nin: [
              new Types.ObjectId(appSettings.role.admin),
              new Types.ObjectId(appSettings.role.campusManager),
            ],
          },
        },
      ],
    } as FilterQuery<Users>;

    if (country)
      filter.$and.push({
        country,
      });
    if (campus)
      filter.$and.push({
        campus,
      });

    if (user.role.name === UserRoles.CAMPUS_MANAGER)
      filter.$and.push({
        campus: user.campus['_id'],
      });

    if (search)
      filter.$and.push({
        $or: [
          { username: SearchDB(search) },
          { email: SearchDB(search) },
          { fullName: SearchDB(search) },
          { talkSamId: SearchDB(search) },
        ],
      });

    const result = await PaginateCustom(
      this.userModel,
      {
        limit,
        page,
      },
      {
        filter,
        sort: {
          campus: -1,
          createdAt: -1,
        },
        populate: [
          {
            path: 'country',
          },
          {
            path: 'campus',
          },
          {
            path: 'role',
          },
          {
            path: 'level',
          },
        ],
      },
    );

    return result;
  }

  async getStudentLms(user: ICurrentUser, query: FilterStudentLmsDto) {
    const {
      limit,
      page,
      campus,
      courses,
      startDate,
      endDate,
      search,
      product,
    } = query;

    const filter = [
      {
        role: new Types.ObjectId(appSettings.role.student),
      },
    ] as FilterQuery<Users>[];

    if (user.role.name === UserRoles.CAMPUS_MANAGER)
      filter.push({
        campus: user.campus['_id'],
      });
    if (campus)
      filter.push({
        campus,
      });
    if (search)
      filter.push({
        $or: [
          {
            username: SearchDB(search),
          },
          {
            fullName: SearchDB(search),
          },
          {
            email: SearchDB(search),
          },
          {
            talkSamId: SearchDB(search),
          },
        ],
      });

    const pipeline = [
      ...FilterAndAggregate<Users>(filter),
      ...PopulateAggregate({
        from: Campus.name,
        foreignField: 'campus',
      }),
      {
        $project: {
          campus: {
            name: 1,
            koreaName: 1,
            code: 1,
          },
          fullName: 1,
          email: 1,
          talkSamId: 1,
          username: 1,
        },
      },
      {
        $sort: {
          'campus.name': 1,
        },
      },
    ] as PipelineStage[];

    const matchApprovalProduct = {
      $match: {
        status: ApprovalProductStatus.ACCEPTED,
      },
    };

    if (product) matchApprovalProduct.$match['course.product'] = product;

    pipeline.push(
      JoinAggregate({
        from: ApprovalProducts.name,
        foreignField: 'student._id',
        as: ApprovalProducts.name,
        pipeline: [
          matchApprovalProduct,
          {
            $project: {
              course: {
                _id: 1,
                name: 1,
              },
              status: 1,
            },
          },
          {
            $lookup: {
              from: 'lessons',
              localField: '_id',
              foreignField: 'approvalProduct',
              as: 'lessons',
              pipeline: [
                {
                  $lookup: {
                    from: 'units',
                    localField: 'unit',
                    foreignField: '_id',
                    as: 'unit',
                    pipeline: [
                      {
                        $sort: {
                          unit: 1,
                        },
                      },
                    ],
                  },
                },
                {
                  $unwind: '$unit',
                },
                {
                  $lookup: {
                    from: 'points',
                    localField: '_id',
                    foreignField: 'lesson',
                    as: 'point',
                  },
                },
                {
                  $unwind: {
                    path: '$point',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $project: {
                    unit: {
                      unit: 1,
                    },
                    isLearnAgain: 1,
                    startDate: 1,
                    endDate: 1,
                    status: 1,
                    point: {
                      point: 1,
                    },
                    dateSubmit: 1,
                    selfEditing: 1,
                    artwork: 1,
                    history: {
                      answer: 1,
                      answerSuggestion: 1,
                    },
                  },
                },
                {
                  $sort: {
                    'unit.unit': 1,
                  },
                },
              ],
            },
          },
          {
            $sort: {
              'course.name': 1,
            },
          },
        ],
      }),
    );

    if (courses)
      pipeline.push(
        ...FilterAggregate<Users>({
          'approvalProducts.course._id': { $in: courses },
        }),
      );

    if (startDate)
      pipeline.push(
        ...FilterAggregate<Users>({
          'approvalProducts.startDate': { $gte: startDate },
        }),
      );
    if (endDate)
      pipeline.push(
        ...FilterAggregate<Users>({
          'approvalProducts.endDate': { $lte: endDate },
        }),
      );

    const users = await PaginateAggregate(
      this.userModel,
      {
        limit,
        page,
      },
      pipeline,
    );

    return users;
  }

  async checkEmail(email: string) {
    const check = await this.userModel.findOne({
      email,
    });

    if (!check) return { message: 'Email can be used' };

    throw new BadRequestException('Email already exists');
  }

  async checkUsername(username: string) {
    const check = await this.userModel.findOne({
      username,
    });

    if (!check) return { message: 'Username can be used' };

    throw new BadRequestException('Username already exists');
  }

  async checkTalkSamId(talkSamId: string) {
    const user = await this.userModel.findOne({
      talkSamId,
    });

    return user;
  }

  async exportExcel(user: ICurrentUser) {
    const filter = {
      role: new Types.ObjectId(appSettings.role.student),
    } as FilterQuery<Users>;

    if (user.role.name === UserRoles.CAMPUS_MANAGER)
      filter.campus = user.campus['_id'];

    const students = await this.userModel
      .find(filter)
      .populate([
        {
          path: 'campus',
          select: 'name -_id',
        },
        {
          path: 'country',
          select: 'name -_id',
        },
      ])
      .select({
        _id: 0,
        talkSamId: 1,
        fullName: 1,
        username: 1,
        email: 1,
        createdAt: 1,
      });

    return students.map((student, index) => {
      const data = {
        ...student.toObject(),
        index: index + 1,
        country: student.country['name'],
        campus: student.campus['name'],
      };

      return data;
    });
  }
}
