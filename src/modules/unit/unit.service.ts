import { Units } from '@common/models/entities/unit.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';

@Injectable()
export class UnitService {
  constructor(@InjectModel(Units.name) private unitModel: Model<Units>) {}

  async getAllByCourse(courseId: string) {
    if (!isValidObjectId(courseId))
      throw new BadRequestException('Invalid course id');

    const units = await this.unitModel.find({
      course: new Types.ObjectId(courseId),
    });

    return units;
  }
}
