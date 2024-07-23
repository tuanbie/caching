import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ModelsModule } from '@common/models/models.module';
import { CachingModule } from '@common/providers/caching/caching.module';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
