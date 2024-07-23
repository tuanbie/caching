import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { ModelsModule } from '@common/models/models.module';
import { GptService } from '@modules/gpt/gpt.service';
import { CachingModule } from '@common/providers/caching/caching.module';
import { FileService } from '@modules/file/file.service';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [PetController],
  providers: [PetService, GptService, FileService],
})
export class PetModule {}
