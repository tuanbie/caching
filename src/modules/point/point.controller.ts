import { Get } from '@nestjs/common';
import { PointService } from './point.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { Caching } from '@common/providers/caching/caching';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';

@CustomController('point')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private caching: Caching,
  ) {}

  @Authorize(UserRoles.STUDENT)
  @Get('student')
  getPointForStudent(@CurrentUser() user: ICurrentUser) {
    return this.pointService.getPointForStudent(user);
  }

  @Authorize(UserRoles.STUDENT)
  @Get('student/history')
  async getHistoryPointStudent(@CurrentUser() user: ICurrentUser) {
    const keyHistory = KeyCache.POINT_HISTORY + user._id.toString();

    const cachedHistory = await this.caching.getValue(keyHistory);

    if (cachedHistory) return cachedHistory;

    const result = await this.pointService.getHistoryPointStudent(user);

    await this.caching.setValue(keyHistory, result, 600);

    return result;
  }
}
