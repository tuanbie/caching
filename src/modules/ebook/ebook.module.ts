import { Module } from '@nestjs/common';
import { EbookService } from './ebook.service';
import { EbookController } from './ebook.controller';
import { ModelsModule } from '@common/models/models.module';
import { FileService } from '@modules/file/file.service';

@Module({
  imports: [ModelsModule],
  controllers: [EbookController],
  providers: [EbookService, FileService],
})
export class EbookModule {}
