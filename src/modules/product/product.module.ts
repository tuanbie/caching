import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ModelsModule } from '@common/models/models.module';
import { Logging } from '@common/providers/logging/logging';
import { CachingModule } from '@common/providers/caching/caching.module';

@Module({
  imports: [ModelsModule, CachingModule],
  controllers: [ProductController],
  providers: [ProductService, Logging],
})
export class ProductModule {}
