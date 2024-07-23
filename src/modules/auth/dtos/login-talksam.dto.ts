import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithTalkSam {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  talkSamId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
