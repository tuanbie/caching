import { Body, Param, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CreateUserDto } from './dtos/create-user.dto';
import { appSettings } from '@common/configs/appSetting';
import { Types } from 'mongoose';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { FilterStudentLmsDto, FilterUserDto } from './dtos/filter-user.dto';
import { UpdateProfileStudentDto } from './dtos/update-user.dto';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { Response } from 'express';
import { toPlainExcel } from '@common/utils/excel.util';

@CustomController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'POST',
    path: 'create/student',
    summary: 'Create a new student (Role: admin | campus)',
  })
  createStudent(
    @Body() payload: CreateUserDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.userService.create(
      payload,
      new Types.ObjectId(appSettings.role.student),
      user,
    );
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'PATCH',
    path: 'update/student/:studentId',
    summary: 'Update student (Role: admin | campus)',
  })
  updateProfileStudent(
    @Body() payload: UpdateProfileStudentDto,
    @Param('studentId') studentId: string,
  ) {
    return this.userService.updateProfileStudent(payload, studentId);
  }

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'POST',
    path: 'create/campus-manager',
    summary: 'Create a new campus manager (Role: admin)',
  })
  createCampusManager(
    @Body() payload: CreateUserDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.userService.create(
      payload,
      new Types.ObjectId(appSettings.role.campusManager),
      user,
    );
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: 'student',
    summary: 'Get list student (Role: admin | campus)',
  })
  getStudents(
    @Query() query: FilterUserDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.userService.getStudents(user, query);
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: 'student/excel',
    summary: 'Get list excel student (Role: admin | campus)',
  })
  async exportExcel(@CurrentUser() user: ICurrentUser, @Res() res: Response) {
    const result = await this.userService.exportExcel(user);

    const fileName =
      user.role.name === UserRoles.ADMIN
        ? 'students.xlsx'
        : `students-[${user.campus['name']}].xlsx`;

    return await toPlainExcel({
      res,
      fileName,
      colTitle: [
        ['No', 'index', 8],
        ['Country', 'country', 15],
        ['Campus', 'campus', 25],
        ['TalkSam ID', 'talkSamId', 18],
        ['Full Name', 'fullName', 20],
        ['Username', 'username', 15],
        ['Email', 'email', 30],
        ['Registration Date', 'createdAt', 18],
      ],
      data: result,
    });
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'GET',
    path: 'student/lms',
    summary: 'Get list student lms (Role: admin | campus)',
  })
  getStudentLms(
    @CurrentUser() user: ICurrentUser,
    @Query() query: FilterStudentLmsDto,
  ) {
    return this.userService.getStudentLms(user, query);
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'POST',
    path: 'check-email/:email',
    summary: 'Check email (Role: admin | campus)',
  })
  checkEmail(@Param('email') email: string) {
    return this.userService.checkEmail(email);
  }
}
