import { PaginateDto } from '@common/dtos/pagination.dto';
import { TransformObjectId } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterCampusDto extends PaginateDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformObjectId()
  country: string;
}
