import { CourseService } from './course.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { Caching } from '@common/providers/caching/caching';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';

@CustomController('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private caching: Caching,
  ) {}

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'GET',
    path: 'student/history',
    summary: "Get student's course history (Role: student)",
  })
  async getStudentHistory(@CurrentUser() user: ICurrentUser) {
    const keyCaching = KeyCache.COURSE_HISTORY + user._id.toString();

    const cachedHistory = await this.caching.getValue(keyCaching);

    if (cachedHistory) return cachedHistory;

    const result = await this.courseService.getStudentHistory(user);

    await this.caching.setValue(keyCaching, result, 600);

    return result;
  }
}
