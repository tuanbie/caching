import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { ApprovalProducts } from '@common/models/entities/approval-product.entity';
import { ICurrentUser } from '@common/types/current-user.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(ApprovalProducts.name)
    private approvalProductModel: Model<ApprovalProducts>,
  ) {}

  async getStudentHistory(user: ICurrentUser) {
    const history: ApprovalProducts[] =
      await this.approvalProductModel.aggregate([
        {
          $match: {
            'student._id': user._id,
            status: ApprovalProductStatus.ACCEPTED,
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'course.product',
            foreignField: '_id',
            as: 'course.product',
          },
        },
        {
          $unwind: '$course.product',
        },
        {
          $project: {
            student: 0,
            creator: 0,
          },
        },
        {
          $sort: {
            'course.product': 1,
            startDate: -1,
          },
        },
      ]);

    const mapProducts = new Map();

    history.map((h) => {
      const productId = h.course.product['_id'].toString();

      const data = {
        product: {
          _id: h.course.product['_id'],
          name: h.course.product['name'],
        },
        course: [
          {
            _id: h.course['_id'],
            name: h.course.name,
          },
        ],
        startDate: h.startDate,
        endDate: h.endDate,
      };

      if (mapProducts.has(productId)) {
        return mapProducts.set(productId, {
          ...data,
          course: [...data.course, ...mapProducts.get(productId).course],
        });
      }

      return mapProducts.set(productId, data);
    });

    const result = [];

    mapProducts.forEach((value, key) => {
      result.push(value);
    });

    return result;
  }
}
