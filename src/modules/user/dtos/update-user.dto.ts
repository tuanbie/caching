import { Types } from 'mongoose';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProfileStudentDto extends CreateUserDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  campus?: Types.ObjectId;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  country?: Types.ObjectId;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  dob?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  email?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  member?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  talkSamId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  withdraw?: boolean;
}
