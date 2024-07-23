import {
  LessonStatus,
  LessonStatusUpdate,
} from '@common/constants/lesson.enum';
import { ApiEnumExample } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateLessonDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  writing: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  chatHistory: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(LessonStatus)
  status: LessonStatus;
}

export class UpdateLessonWritingDto {
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  writing: string;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  timeWriting: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  save: boolean;
}

export class UpdateLessonSelfEditingDto {
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  writing: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  save: boolean;
}

export class UpdateLessonStatusDto {
  @ApiProperty({
    example: ApiEnumExample(LessonStatusUpdate),
  })
  @IsNotEmpty()
  @IsEnum(LessonStatusUpdate)
  status: LessonStatusUpdate;
}
