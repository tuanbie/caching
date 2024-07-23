import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ModulesModule } from './modules/modules.module';
import { ModelsModule } from './common/models/models.module';

@Module({
  imports: [ModulesModule, ModelsModule],
  providers: [AppService],
})
export class AppModule {}
