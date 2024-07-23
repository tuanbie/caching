import { Products } from '@common/models/entities/product.entity';
import {
  FilterAggregate,
  JoinAggregate,
  PaginateAggregate,
  PopulateAggregate,
  SearchDB,
} from '@common/utils/db.util';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { FilterProductDto } from './dtos/filter-product.dto';
import { Courses } from '@common/models/entities/course.entity';
import { Levels } from '@common/models/entities/level.entity';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';
import { Caching } from '@common/providers/caching/caching';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Products.name) private productModel: Model<Products>,
    private caching: Caching,
  ) {}

  async getAll(query: FilterProductDto) {
    const keyProducts = KeyCache.GET_ALL_PRODUCTS;

    const cachedProducts = await this.caching.getValue(keyProducts);

    if (cachedProducts) return cachedProducts;

    const { limit, page, search } = query;

    const pipeline = [] as PipelineStage[];

    if (search)
      pipeline.push(
        ...FilterAggregate<Products>({
          name: SearchDB(search),
        }),
      );

    pipeline.push(
      JoinAggregate({
        from: Courses.name,
        foreignField: 'product',
        as: 'courses',
      }),
      ...PopulateAggregate({
        from: Levels.name,
        foreignField: 'level',
      }),
    );

    const products = await PaginateAggregate(
      this.productModel,
      {
        page,
        limit,
      },
      pipeline,
    );

    await this.caching.setValue(keyProducts, products, 1800);

    return products;
  }
}
