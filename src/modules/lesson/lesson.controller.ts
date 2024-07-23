import { Body, Param, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import {
  FilterLessonStudentDto,
  QueryArtworksDto,
} from './dtos/filter-lesson.dto';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import {
  UpdateLessonSelfEditingDto,
  UpdateLessonStatusDto,
  UpdateLessonWritingDto,
} from './dtos/update-lesson.dto';
import { ChatbotLessonDto, ChatbotLessonImagesDto } from './dtos/chatbot.dto';
import {
  CustomUploadFile,
  ValidateFilePNG,
} from '@common/decorators/upload-file.decorator';
import { RestMethod } from '@common/decorators/rest-method.decorator';
import { LessonStatus } from '@common/constants/lesson.enum';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';
import { Caching } from '@common/providers/caching/caching';

@CustomController('lesson')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private caching: Caching,
  ) {}

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'GET',
    path: 'student',
    summary: 'Get all lessons for students (role: student)',
  })
  async getForStudent(
    @CurrentUser() user: ICurrentUser,
    @Query() query: FilterLessonStudentDto,
  ) {
    const keyLesson = KeyCache.LESSON_STUDENTS + user._id.toString();

    const cachedResult = await this.caching.getValue(keyLesson);

    if (cachedResult) return cachedResult;

    const result = await this.lessonService.getForStudent(user, query);

    await this.caching.setValue(keyLesson, result, 600);

    return result;
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'GET',
    path: 'student/detail/:lessonId',
    summary: 'Get lesson detail for student (role: student)',
  })
  async getDetailForStudent(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const keyLessonDetail = KeyCache.LESSON_DETAIL + lessonId;

    const cachedResult = await this.caching.getValue(keyLessonDetail);

    if (cachedResult) return cachedResult;

    const result = await this.lessonService.getDetailForStudent(lessonId, user);

    await this.caching.setValue(keyLessonDetail, result, 600);

    return result;
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'POST',
    path: 'student/chatbot/:lessonId',
    summary: `Chat bot ${LessonStatus.BRAIN_STORING} (role: student)`,
  })
  chatbotLesson(
    @Param('lessonId') lessonId: string,
    @Body() body: ChatbotLessonDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.lessonService.chatbotLesson(lessonId, body.question, user);
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'POST',
    path: 'student/chatbot-images/:lessonId',
    summary: `Chat bot image ${LessonStatus.BRAIN_STORING} (role: student)`,
  })
  chatbotLessonImages(
    @Param('lessonId') lessonId: string,
    @Body() body: ChatbotLessonImagesDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.lessonService.chatbotLessonImages(
      lessonId,
      body.question,
      body.images,
      user,
    );
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'PATCH',
    path: 'student/writing/:lessonId',
    summary: `Writing topic (role: student)`,
  })
  async updateStatusWritingForStudent(
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonWritingDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.caching.clearCacheLessonDetail(lessonId);
    return this.lessonService.updateLessonWriting(lessonId, body, user);
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'PATCH',
    path: 'student/self-editing/:lessonId',
    summary: `Update self editing (role: student)`,
  })
  async updateStatusSelfEditingForStudent(
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonSelfEditingDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    await Promise.all([
      this.caching.clearCacheLessonStudent(user._id.toString()),
      this.caching.clearCacheLessonDetail(lessonId),
    ]);

    return await this.lessonService.updateLessonSelfEditing(
      lessonId,
      body,
      user,
    );
  }

  @CustomUploadFile('artwork')
  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'PATCH',
    path: 'student/artwork/:lessonId',
    summary: `Create artwork (role: student)`,
  })
  async updateArtworkLesson(
    @Param('lessonId') lessonId: string,
    @ValidateFilePNG() file: Express.Multer.File,
    @CurrentUser() user: ICurrentUser,
  ) {
    await Promise.all([
      this.caching.clearCacheStudent(user._id.toString()),
      this.caching.clearCacheLessonDetail(lessonId),
    ]);
    return await this.lessonService.updateArtworkLesson(lessonId, file);
  }

  @Authorize(UserRoles.STUDENT)
  @RestMethod({
    method: 'GET',
    path: 'student/artwork',
    summary: `Get all artwork for student (role: student)`,
  })
  getArtworkLesson(
    @Query() query: QueryArtworksDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.lessonService.getArtworkLesson(query, user);
  }

  @Authorize(UserRoles.ADMIN)
  @RestMethod({
    method: 'POST',
    path: 'learn-again/:lessonId',
    summary: `Let students study again (role: admin)`,
  })
  learnAgainForStudent(@Param('lessonId') lessonId: string) {
    return this.lessonService.learnAgainForStudent(lessonId);
  }

  @Authorize(UserRoles.ADMIN, UserRoles.CAMPUS_MANAGER)
  @RestMethod({
    method: 'PATCH',
    path: 'update/status/:lessonId',
    summary: `Update student's learning progress (role: admin | campus)`,
  })
  updateLessonStatus(
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonStatusDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.lessonService.updateLessonStatus(lessonId, body.status, user);
  }
}
