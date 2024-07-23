import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Levels } from './level.entity';

export type ProductDocument = HydratedDocument<Products>;

@CustomEntity(Products.name)
export class Products {
  @Prop({ type: String, index: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Levels.name, index: true })
  level: Levels;
}

export const ProductSchema = SchemaFactory.createForClass(Products);
