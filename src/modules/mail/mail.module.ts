import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { appSettings } from '@common/configs/appSetting';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: `smtp://${appSettings.mail.user}:${appSettings.mail.password}@smtp.gmail.com`,
      defaults: {
        from: `"Fpoly Recruitment" ${appSettings.mail.user}`,
        name: 'Fpoly Recruitment',
      },
      template: {
        dir: join(process.cwd(), 'templates'),
        adapter: new EjsAdapter({
          inlineCssEnabled: false,
        }),
        options: {
          strict: false,
        },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
