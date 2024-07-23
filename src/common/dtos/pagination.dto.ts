import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginateDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  search: string;
}
