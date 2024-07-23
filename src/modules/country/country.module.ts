import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { ModelsModule } from '@common/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
