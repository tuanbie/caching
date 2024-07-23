import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChatbotLessonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;
}

export class ChatbotLessonImagesDto extends ChatbotLessonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  images: number;
}
