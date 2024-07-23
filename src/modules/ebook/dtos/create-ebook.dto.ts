import { TransformObjectIds } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateEbookDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  bookCover: Express.Multer.File;

  @ApiProperty()
  @IsNotEmpty()
  author: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @TransformObjectIds()
  artworks: Types.ObjectId[];
}
