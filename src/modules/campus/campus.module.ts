import { Module } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { ModelsModule } from '@common/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [CampusController],
  providers: [CampusService],
})
export class CampusModule {}
