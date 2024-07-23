import { appSettings } from '@common/configs/appSetting';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(payload: {
    sendTo: string;
    subject: string;
    context: any;
    template: string;
  }) {
    const { sendTo, subject, context, template } = payload;
    try {
      return this.mailerService.sendMail({
        to: sendTo,
        from: {
          address: appSettings.mail.user,
          name: 'Fpoly Recruitment System',
        },
        subject: subject,
        template: template,
        context: context,
      });
    } catch (e) {
      throw new HttpException(
        {
          error: true,
          data: null,
          message: 'Cannot send email',
          code: 0,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
