import { Countries } from '@common/models/entities/country.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CountryService {
  constructor(
    @InjectModel(Countries.name) private countryModel: Model<Countries>,
  ) {}

  async getAllCountries() {
    return await this.countryModel.find();
  }
}
