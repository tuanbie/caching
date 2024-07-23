import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';

@CustomController('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
}
