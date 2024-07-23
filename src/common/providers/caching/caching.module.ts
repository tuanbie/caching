import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Caching } from './caching';

@Module({
  imports: [CacheModule.register()],
  providers: [Caching],
  exports: [CacheModule, Caching],
})
export class CachingModule {}
