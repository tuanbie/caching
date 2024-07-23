import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { ModelsModule } from '@common/models/models.module';
import { CachingModule } from '@common/providers/caching/caching.module';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
