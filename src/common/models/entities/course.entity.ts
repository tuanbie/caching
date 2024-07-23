import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Products } from './product.entity';

export type CourseDocument = HydratedDocument<Courses>;

@CustomEntity(Courses.name)
export class Courses {
  @Prop()
  name: string;

  @Prop()
  paragraph: number;

  @Prop()
  minimumNumberOfWords: number;

  @Prop({ type: Types.ObjectId, ref: Products.name, index: true })
  product: Products | Types.ObjectId | string;
}

export const CourseSchema = SchemaFactory.createForClass(Courses);
