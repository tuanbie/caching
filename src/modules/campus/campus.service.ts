import { Campus } from '@common/models/entities/campus.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { FilterCampusDto } from './dtos/filter-campus.dto';
import { PaginateCustom, SearchDB } from '@common/utils/db.util';
import { UpdateCampusDto } from './dtos/update-campu.dto';
import { Users } from '@common/models/entities/user.entity';

@Injectable()
export class CampusService {
  constructor(
    @InjectModel(Campus.name) private campusModel: Model<Campus>,
    @InjectModel(Users.name) private userModel: Model<Users>,
  ) {}

  async getAllCampuses(query: FilterCampusDto) {
    const { limit, page, search, country } = query;

    const filter = {} as FilterQuery<Campus>;

    if (country)
      filter.$and = [
        {
          country,
        },
      ];

    if (search)
      filter.$and.push({
        $or: [
          {
            name: SearchDB(search),
          },
          {
            code: SearchDB(search),
          },
          {
            koreaName: SearchDB(search),
          },
        ],
      });

    return await PaginateCustom(
      this.campusModel,
      { limit, page },
      {
        filter,
      },
    );
  }

  async updateCampus(campusId: string, body: UpdateCampusDto) {
    const campus = await this.campusModel.findByIdAndUpdate(campusId, body, {
      new: true,
    });

    if (!campus) throw new BadRequestException('Campus not found');

    return campus;
  }

  async deleteCampus(CampusId: string) {
    const campus = await this.campusModel.findById(CampusId);

    if (!campus) throw new BadRequestException('Campus not found');

    const checkCampus = await this.userModel.countDocuments({
      campus: campus._id,
    });

    if (checkCampus > 0)
      throw new BadRequestException(
        'Campus already has students, it cannot be deleted',
      );

    await campus.deleteOne();

    return { message: 'Campus deleted successfully' };
  }
}
