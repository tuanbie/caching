import { TransformObjectId } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateCampusDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @TransformObjectId()
  country: Types.ObjectId;
}
