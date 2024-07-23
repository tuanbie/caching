import { Body, Post, UploadedFile } from '@nestjs/common';
import { GptService } from './gpt.service';
import { CustomUploadFile } from '@common/decorators/upload-file.decorator';
import { TextToSpeechDto } from './dtos/gpt.dto';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CustomController } from '@common/decorators/custom-controller.decorator';

@CustomController('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Authorize(UserRoles.STUDENT)
  @CustomUploadFile('file')
  @Post('speech-to-text')
  speechToText(@UploadedFile() file: Express.Multer.File) {
    return this.gptService.speechToText(file);
  }

  @Authorize(UserRoles.STUDENT)
  @Post('text-to-speech')
  textToSpeech(@Body() data: TextToSpeechDto) {
    return this.gptService.textToSpeech(data.text);
  }

  @Authorize(UserRoles.STUDENT)
  @Post('generate-images')
  generateImages(@Body() data: TextToSpeechDto) {
    return this.gptService.generateImages(data.text);
  }
}
