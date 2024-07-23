import { Module } from '@nestjs/common';
import { ApprovalProductService } from './approval-product.service';
import { ApprovalProductController } from './approval-product.controller';
import { ModelsModule } from '@common/models/models.module';
import { Logging } from '@common/providers/logging/logging';
import { LessonService } from '@modules/lesson/lesson.service';
import { CachingModule } from '@common/providers/caching/caching.module';
import { GptService } from '@modules/gpt/gpt.service';
import { FileService } from '@modules/file/file.service';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [ApprovalProductController],
  providers: [
    ApprovalProductService,
    Logging,
    LessonService,
    GptService,
    FileService,
  ],
})
export class ApprovalProductModule {}
