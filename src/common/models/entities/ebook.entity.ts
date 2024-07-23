import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Lessons } from './lesson.entity';
import { Users } from './user.entity';

export type EbookDocument = HydratedDocument<Ebooks>;

@CustomEntity(Ebooks.name)
export class Ebooks {
  @Prop()
  title: string;

  @Prop()
  uri: string;

  @Prop()
  bookCover: string;

  @Prop()
  author: string;

  @Prop({ type: Array, ref: Lessons.name, index: true })
  artworks: Lessons[] | Types.ObjectId[] | string[];

  @Prop({ type: Types.ObjectId, ref: Users.name, index: true })
  student: Users | Types.ObjectId | string;
}

export const EbookSchema = SchemaFactory.createForClass(Ebooks);
