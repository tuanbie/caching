import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Courses } from './course.entity';
import { Users } from './user.entity';
import { ApprovalProductStatus } from '@common/constants/approval-product.enum';
import { Campus } from './campus.entity';

export type ApprovalProductDocument = HydratedDocument<ApprovalProducts>;

@CustomEntity(ApprovalProducts.name)
export class ApprovalProducts {
  @Prop({ type: Object })
  course: Courses;

  @Prop({ type: Object })
  student: Users;

  @Prop({ type: Object })
  creator: Users;

  @Prop({ type: Date, required: false, default: null, index: true })
  startDate?: Date;

  @Prop({ type: Date, required: false, default: null, index: true })
  endDate?: Date;

  @Prop({
    type: String,
    enum: ApprovalProductStatus,
    required: false,
    default: ApprovalProductStatus.PENDING,
  })
  status?: ApprovalProductStatus;
}

export const ApprovalProductSchema =
  SchemaFactory.createForClass(ApprovalProducts);
ApprovalProductSchema.index({ 'creator.campus.name': 1 });
ApprovalProductSchema.index({ 'student._id': 1 });
ApprovalProductSchema.index({ 'course._id': 1 });
ApprovalProductSchema.index({ 'course.product': 1 });
