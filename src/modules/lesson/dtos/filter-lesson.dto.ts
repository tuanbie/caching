import { PaginateDto } from '@common/dtos/pagination.dto';
import {
  TransformArrayQueryObjectIds,
  TransformObjectIds,
} from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class FilterLessonStudentDto extends PaginateDto {}

export class QueryArtworksDto extends PaginateDto {
  @ApiProperty()
  @IsOptional()
  @TransformArrayQueryObjectIds()
  lessonIds: Types.ObjectId[];
}
