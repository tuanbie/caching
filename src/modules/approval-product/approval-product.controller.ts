import { Body, Param, Query } from '@nestjs/common';
import { ApprovalProductService } from './approval-product.service';
import { CreateApprovalProductDto } from './dtos/create-approval-product.dto';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { FilterApprovalProduct } from './dtos/filter-approval-product.dto';
import { UpdateStatusApprovalProductDto } from './dtos/update-approval-product.dto';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { ApprovalProductStatus } from '@common/constants/approval-product.enum';

@CustomController('approval-product')
export class ApprovalProductController {
  constructor(
    private readonly approvalProductService: ApprovalProductService,
  ) {}

  @Authorize(UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'POST',
    summary: 'Create approval product (role: campus)',
  })
  approvalProduct(
    @Body() body: CreateApprovalProductDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.approvalProductService.approveProduct(user, body);
  }

  @Authorize(UserRoles.CAMPUS_MANAGER, UserRoles.ADMIN)
  @RestMethod({
    method: 'GET',
    path: '/status/:status',
    summary: 'Get list approval by status (role: admin | campus)',
  })
  getAll(
    @CurrentUser() user: ICurrentUser,
    @Query() query: FilterApprovalProduct,
    @Param('status') status: ApprovalProductStatus,
  ) {
    return this.approvalProductService.getAll(user, query, status);
  }

  @Authorize(UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'DELETE',
    path: ':approvalId',
    summary: 'Delete approval if its status is pending (role: campus)',
  })
  deleteApproval(@Param('approvalId') approvalId: string) {
    return this.approvalProductService.deleteApproval(approvalId);
  }

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'PATCH',
    path: 'status',
    summary: 'Update approval status (role: admin)',
  })
  updateStatus(@Body() body: UpdateStatusApprovalProductDto) {
    return this.approvalProductService.updateStatus(
      body.approvalIds,
      body.status,
    );
  }
}
