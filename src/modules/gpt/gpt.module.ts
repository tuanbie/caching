import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { FileService } from '@modules/file/file.service';

@Module({
  controllers: [GptController],
  providers: [GptService, FileService],
})
export class GptModule {}
