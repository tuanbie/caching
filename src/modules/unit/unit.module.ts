import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { ModelsModule } from '@common/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
