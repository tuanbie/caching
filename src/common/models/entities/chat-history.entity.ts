import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.entity';
import { Lessons } from './lesson.entity';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

@CustomEntity(ChatHistory.name)
export class ChatHistory {
  @Prop({ type: Types.ObjectId, ref: Users.name, index: true })
  student: Users | Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Lessons.name, index: true })
  lesson: Lessons | Types.ObjectId | string;

  @Prop({ type: Array, required: false, default: [] })
  history: string[];
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
