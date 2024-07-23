import { TransformObjectId } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @ApiProperty({
    example: 'ObjectId',
  })
  @IsOptional()
  @TransformObjectId()
  campus?: Types.ObjectId;

  @ApiProperty({
    example: 'ObjectId',
  })
  @IsOptional()
  @TransformObjectId()
  country?: Types.ObjectId;

  @ApiProperty({
    example: new Date().toISOString(),
  })
  @IsNotEmpty()
  dob?: string;

  @ApiProperty({
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty()
  @IsNotEmpty()
  password?: string;

  @ApiProperty()
  @IsOptional()
  talkSamId?: string;

  @ApiProperty()
  @IsNotEmpty()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  member?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  withdraw?: boolean;
}
