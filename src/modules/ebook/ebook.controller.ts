import { Body, Get, Param, Post, Query } from '@nestjs/common';
import { EbookService } from './ebook.service';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CreateEbookDto } from './dtos/create-ebook.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { ApiConsumes } from '@nestjs/swagger';
import { FilterEbookDto } from './dtos/filter-ebook.dto';

@CustomController('ebook')
export class EbookController {
  constructor(private readonly ebookService: EbookService) {}

  @ApiConsumes('multipart/form-data')
  @Authorize(UserRoles.STUDENT)
  @Post('create')
  createEbook(@Body() body: CreateEbookDto, @CurrentUser() user: ICurrentUser) {
    return this.ebookService.create(body, user);
  }

  @ApiConsumes('multipart/form-data')
  @Authorize(UserRoles.STUDENT)
  @Post('update/:ebookId')
  updateEbook(
    @Param('ebookId') ebookId: string,
    @Body() body: CreateEbookDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.ebookService.update(ebookId, body, user);
  }

  @Authorize(UserRoles.STUDENT)
  @Get('student/all')
  getAllForStudent(@CurrentUser() user: ICurrentUser) {
    return this.ebookService.getAllForStudent(user);
  }

  @Authorize(UserRoles.CAMPUS_MANAGER, UserRoles.ADMIN)
  @Get('all')
  getAll(@CurrentUser() user: ICurrentUser, @Query() query: FilterEbookDto) {
    return this.ebookService.getAll(user, query);
  }
}
