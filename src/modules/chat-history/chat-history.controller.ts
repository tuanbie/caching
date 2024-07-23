import { Param } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CustomController } from '@common/decorators/custom-controller.decorator';

@CustomController('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: '/:lessonId',
    summary: 'Get chat history for a specific lesson (role: admin | campus)',
  })
  getChatHistory(@Param('lessonId') lessonId: string) {
    return this.chatHistoryService.getChatHistory(lessonId);
  }
}
