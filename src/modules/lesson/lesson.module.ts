import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { ModelsModule } from '@common/models/models.module';
import { CachingModule } from '@common/providers/caching/caching.module';
import { GptService } from '@modules/gpt/gpt.service';
import { FileService } from '@modules/file/file.service';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [LessonController],
  providers: [LessonService, GptService, FileService],
})
export class LessonModule {}
