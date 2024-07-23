import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateApprovalProductDto {
  @ApiProperty({
    isArray: true,
    example: ['ObjectId', 'ObjectId'],
  })
  @IsArray()
  @IsNotEmpty()
  @Transform((param) => param.value.map((item) => new Types.ObjectId(item)))
  courses: Types.ObjectId[];

  @ApiProperty({
    isArray: true,
    example: ['ObjectId', 'ObjectId'],
  })
  @IsArray()
  @IsNotEmpty()
  @Transform((param) => param.value.map((item) => new Types.ObjectId(item)))
  students: Types.ObjectId[];
}
