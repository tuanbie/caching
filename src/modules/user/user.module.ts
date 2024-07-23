import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ModelsModule } from '@common/models/models.module';
import { Logging } from '@common/providers/logging/logging';
import { PointService } from '@modules/point/point.service';
import { CachingModule } from '@common/providers/caching/caching.module';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [UserController],
  providers: [UserService, Logging, PointService],
})
export class UserModule {}
