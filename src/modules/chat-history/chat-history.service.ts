import { ChatHistory } from '@common/models/entities/chat-history.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectModel(ChatHistory.name) private chatHistoryModel: Model<ChatHistory>,
  ) {}

  async getChatHistory(lessonId: string) {
    const chatHistory = await this.chatHistoryModel.findOne({
      lesson: new Types.ObjectId(lessonId),
    });

    if (!chatHistory) return null;

    return chatHistory.history;
  }
}
