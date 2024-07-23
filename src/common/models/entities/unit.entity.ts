import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Courses } from './course.entity';

export type UnitDocument = HydratedDocument<Units>;

@CustomEntity(Units.name)
export class Units {
  @Prop({ type: Types.ObjectId, ref: Courses.name, index: true })
  course: Courses | Types.ObjectId | string;

  @Prop()
  unit: number;

  @Prop()
  sub: string;

  @Prop()
  topic: string;

  @Prop()
  minimumNumberOfCharacters: number;

  @Prop()
  maximumNumberOfCharacters: number;

  @Prop()
  genre: string;

  @Prop()
  vocabulary: string;

  @Prop()
  textComplexity: string;

  @Prop()
  primarySentenceStructure: string;

  @Prop()
  gradeLevel: string;

  @Prop()
  features: string;

  @Prop()
  sentenceLength: string;

  @Prop()
  grammar: string;

  @Prop()
  lexileRange: string;

  @Prop()
  writingPoint: string;
}

export const UnitSchema = SchemaFactory.createForClass(Units);
