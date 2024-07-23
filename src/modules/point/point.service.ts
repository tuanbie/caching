import { Points } from '@common/models/entities/point.entity';
import { ICurrentUser } from '@common/types/current-user.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PointService {
  constructor(@InjectModel(Points.name) private pointModel: Model<Points>) {}

  async getPointForStudent(user: ICurrentUser) {
    const points = await this.pointModel.aggregate([
      {
        $match: {
          student: user._id,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$point' },
        },
      },
    ]);

    const point = points.length > 0 ? points[0].total : 0;

    return { point };
  }

  async getHistoryPointStudent(user: ICurrentUser) {
    const history = await this.pointModel
      .find({
        student: user._id,
      })
      .populate({
        path: 'lesson',
        select: 'unit dateSubmit',
        populate: [
          {
            path: 'unit',
            select: 'unit course',
            populate: {
              path: 'course',
              select: 'name',
            },
          },
        ],
      })
      .select('point lesson')
      .sort({
        createdAt: -1,
      });

    return history;
  }
}
