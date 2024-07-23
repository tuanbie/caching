import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { ApiEnumExample } from '@common/utils/dto.util';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateStatusApprovalProductDto {
  @ApiProperty({
    isArray: true,
    example: ['5f645d75091174000065165a'],
  })
  @IsArray()
  @IsNotEmpty()
  @Transform((param) =>
    param.value.map((item) => new Types.ObjectId(item.toString())),
  )
  approvalIds: Types.ObjectId[] = [];

  @ApiProperty({
    example: ApiEnumExample(ApprovalProductStatus),
  })
  @IsEnum(ApprovalProductStatus)
  @IsNotEmpty()
  status: ApprovalProductStatus;
}
