import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.entity';
import { Lessons } from './lesson.entity';

export type PointDocument = HydratedDocument<Points>;

@CustomEntity(Points.name)
export class Points {
  @Prop({ type: Types.ObjectId, ref: Users.name, index: true })
  student: Users | Types.ObjectId | string;

  @Prop()
  point: number;

  @Prop({ type: Types.ObjectId, ref: Lessons.name, index: true })
  lesson: Lessons | Types.ObjectId | string;
}

export const PointSchema = SchemaFactory.createForClass(Points);
