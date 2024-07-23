import { appSettings } from '@common/configs/appSetting';
import { FileService } from '@modules/file/file.service';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class GptService {
  private openAI: OpenAI;

  constructor(private fileService: FileService) {
    this.openAI = new OpenAI({
      apiKey: appSettings.openAI.key9,
    });
  }

  async speechToText(file: Express.Multer.File) {
    this.openAI = new OpenAI({
      apiKey: appSettings.openAI.key6,
    });
    const filePath = join('resource', file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    const stream = fs.createReadStream(filePath);
    const transcript = await this.openAI.audio.transcriptions.create({
      model: 'whisper-1',
      file: stream,
      prompt:
        "Could you identify the Korean intonation? When they speak English, keep their English intact, don't switch to Korean.",
    });
    const text = transcript.text;

    return {
      text,
    };
  }

  async textToSpeech(text: string) {
    const uuid = new Date().getTime();
    this.openAI = new OpenAI({
      apiKey: appSettings.openAI.key6,
    });

    const mp3 = await this.openAI.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: `..... ${text}`,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    const audioUrl = await this.fileService.uploadBuffer(
      `audio-${uuid}`,
      buffer,
    );

    return audioUrl;
  }

  async generateImages(prompt: string) {
    const response = await this.openAI.images.generate({
      prompt,
      // model: 'dall-e-3',
      n: 4,
      size: '256x256',
    });

    return response.data;
  }

  async generateImagesByChatbot(prompt: string, n: number) {
    const response = await this.openAI.images.generate({
      prompt,
      // model: 'dall-e-3',
      n,
      size: '256x256',
    });

    return response.data;
  }
}
