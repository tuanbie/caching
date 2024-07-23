import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMascotDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;
}
