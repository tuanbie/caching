import { Body, Param, Query } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { FilterCampusDto } from './dtos/filter-campus.dto';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { UpdateCampusDto } from './dtos/update-campu.dto';

@CustomController('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'GET',
    path: 'all',
    summary: 'Get all campus (role: admin)',
  })
  getAllCampuses(@Query() query: FilterCampusDto) {
    return this.campusService.getAllCampuses(query);
  }

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'PATCH',
    path: 'update/:campusId',
    summary: 'Update campus (role: admin)',
  })
  updateCampus(
    @Param('campusId') campusId: string,
    @Body() body: UpdateCampusDto,
  ) {
    return this.campusService.updateCampus(campusId, body);
  }

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'DELETE',
    path: 'delete/:campusId',
    summary: 'Delete campus (role: admin)',
  })
  deleteCampus(@Param('campusId') campusId: string) {
    return this.campusService.deleteCampus(campusId);
  }
}
