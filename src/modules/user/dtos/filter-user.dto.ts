import { PaginateDto } from '@common/dtos/pagination.dto';
import {
  TransformArrayQueryObjectIds,
  TransformObjectId,
} from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class FilterUserDto extends PaginateDto {
  @ApiProperty({
    required: false,
    type: 'string',
  })
  @IsOptional()
  @TransformObjectId()
  country: Types.ObjectId;

  @ApiProperty({
    required: false,
    type: 'string',
  })
  @IsOptional()
  @TransformObjectId()
  campus: Types.ObjectId;
}

export class FilterStudentLmsDto extends PaginateDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformObjectId()
  product: Types.ObjectId;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformObjectId()
  campus: Types.ObjectId;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Array)
  @TransformArrayQueryObjectIds()
  courses: Types.ObjectId[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform((param) => new Date(param.value))
  startDate: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform((param) => new Date(param.value))
  endDate: string;
}
