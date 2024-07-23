import { UserRoles } from '@common/constants/role.enum';
import { UnitService } from './unit.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { Param } from '@nestjs/common';
import { Authorize } from '@common/decorators/authorize.decorator';

@CustomController('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: 'course/:courseId',
    summary: 'Get all lessons by course id (role: admin | campus)',
  })
  getAllByCourse(@Param('courseId') courseId: string) {
    return this.unitService.getAllByCourse(courseId);
  }
}
