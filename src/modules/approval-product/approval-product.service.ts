import { ApprovalProducts } from '@common/models/entities/approval-product.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, Model, PipelineStage, Types } from 'mongoose';
import { CreateApprovalProductDto } from './dtos/create-approval-product.dto';
import { ICurrentUser } from '@common/types/current-user.type';
import { FilterApprovalProduct } from './dtos/filter-approval-product.dto';
import {
  OrAggregate,
  PaginateAggregate,
  PopulateAggregate,
  SearchDB,
} from '@common/utils/db.util';
import { Courses } from '@common/models/entities/course.entity';
import { Users } from '@common/models/entities/user.entity';
import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { LessonService } from '@modules/lesson/lesson.service';
import { Caching } from '@common/providers/caching/caching';
import { UserRoles } from '@common/constants/role.enum';

@Injectable()
export class ApprovalProductService {
  constructor(
    @InjectModel(ApprovalProducts.name)
    private approvalProductModel: Model<ApprovalProducts>,
    @InjectModel(Courses.name)
    private courseModel: Model<Courses>,
    @InjectModel(Users.name)
    private userModel: Model<Users>,
    private caching: Caching,
    private lessonService: LessonService,
  ) {}

  async approveProduct(user: ICurrentUser, payload: CreateApprovalProductDto) {
    const { courses, students } = payload;

    const [dataCourses, dataStudents] = await Promise.all([
      this.courseModel.find({
        _id: { $in: courses },
      }),
      this.userModel.find({
        _id: { $in: students },
      }),
    ]);

    const data = [] as AnyBulkWriteOperation<ApprovalProducts>[];

    dataStudents.forEach((student) => {
      dataCourses.forEach((course) => {
        data.push({
          insertOne: {
            document: {
              course,
              creator: user,
              student,
            },
          },
        });
      });
    });

    await this.approvalProductModel.bulkWrite(data).catch((err) => {
      throw new InternalServerErrorException(err.message);
    });

    return { message: 'Approval Product successfully approved' };
  }

  async getAll(
    user: ICurrentUser,
    query: FilterApprovalProduct,
    status: ApprovalProductStatus,
  ) {
    const { limit, page, search } = query;

    const pipeline = [
      {
        $match: {
          $and: [
            {
              status,
            },
          ],
        },
      },
    ] as PipelineStage[];

    if (user.role.name === UserRoles.CAMPUS_MANAGER)
      pipeline[0]['$match']['$and'].push({
        'creator._id': user._id,
      });

    pipeline.push(
      ...PopulateAggregate({
        from: 'products',
        foreignField: 'course.product',
      }),
      ...PopulateAggregate({
        from: 'countries',
        foreignField: 'student.country',
      }),
      ...PopulateAggregate({
        from: 'campus',
        foreignField: 'student.campus',
      }),
    );

    if (search)
      pipeline[0]['$match']['$and'].push(
        OrAggregate([
          {
            'creator.campus.name': SearchDB(search),
          },
          {
            'student.email': SearchDB(search),
          },
          {
            'student.fullName': SearchDB(search),
          },
          {
            'student.username': SearchDB(search),
          },
        ])[0]['$match'],
      );

    const result = await PaginateAggregate(
      this.approvalProductModel,
      {
        limit,
        page,
      },
      pipeline,
    );

    return result;
  }

  async deleteApproval(approvalId: string) {
    const approval = await this.approvalProductModel.findById(approvalId);

    if (!approval) throw new BadRequestException('Approval does not exist');

    if (approval.status !== ApprovalProductStatus.PENDING)
      throw new BadRequestException(
        'The request has been approved, you do not have the right to cancel the request',
      );

    await approval.deleteOne();

    return approval;
  }

  async updateStatus(
    approvalIds: Types.ObjectId[],
    status: ApprovalProductStatus,
  ) {
    const approvals = await this.approvalProductModel.find({
      _id: { $in: approvalIds },
    });

    if (approvals.length <= 0)
      throw new BadRequestException('Approval does not exist');

    await Promise.all(
      approvals.map(async (approval) => {
        approval.status = status;

        if (status !== ApprovalProductStatus.ACCEPTED) return approval.save();

        approval.startDate = new Date();
        approval.endDate = new Date(
          new Date().setDate(new Date().getDay() + 105),
        );

        return await Promise.all([
          approval.save(),
          this.lessonService.createForStudent(approval),
          this.caching.clearCacheCourseStudent(
            approval.student['_id'].toString(),
          ),
        ]);
      }),
    );

    return { message: 'Approval status updated successfully' };
  }
}
