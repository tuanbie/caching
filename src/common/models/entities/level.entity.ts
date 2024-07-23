import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LevelDocument = HydratedDocument<Levels>;

@CustomEntity(Levels.name)
export class Levels {
  @Prop()
  name: string;
}

export const LevelSchema = SchemaFactory.createForClass(Levels);
