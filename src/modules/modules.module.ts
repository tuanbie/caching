import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';
import { CourseModule } from './course/course.module';
import { UnitModule } from './unit/unit.module';
import { CountryModule } from './country/country.module';
import { CampusModule } from './campus/campus.module';
import { ApprovalProductModule } from './approval-product/approval-product.module';
import { LessonModule } from './lesson/lesson.module';
import { PetModule } from './pet/pet.module';
import { GptModule } from './gpt/gpt.module';
import { FileModule } from './file/file.module';
import { EbookModule } from './ebook/ebook.module';
import { PointModule } from './point/point.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MailModule,
    ProductModule,
    CourseModule,
    UnitModule,
    CountryModule,
    CampusModule,
    ApprovalProductModule,
    LessonModule,
    PetModule,
    GptModule,
    FileModule,
    EbookModule,
    PointModule,
    ChatHistoryModule,
  ],
})
export class ModulesModule {}
