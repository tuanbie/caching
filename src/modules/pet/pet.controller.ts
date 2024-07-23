import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PetService } from './pet.service';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { ChatMascotDto } from './dtos/chat-mascot.dto';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';
import { Caching } from '@common/providers/caching/caching';

@CustomController('pet')
export class PetController {
  constructor(
    private readonly petService: PetService,
    private caching: Caching,
  ) {}

  @Authorize(...Object.values(UserRoles))
  @Get('all')
  async getAllPets() {
    const keyAllPets = KeyCache.GET_ALL_PETS;

    const cachedResult = await this.caching.getValue(keyAllPets);

    if (cachedResult) return cachedResult;

    const result = await this.petService.getAllPets();

    await this.caching.setValue(keyAllPets, result, 1800);

    return result;
  }

  @Authorize(...Object.values(UserRoles))
  @Get('my-pet')
  getAllMyPets(@CurrentUser() user: ICurrentUser) {
    return this.petService.getAllMyPets(user);
  }

  @Authorize(UserRoles.STUDENT)
  @Post('chat-mascot/:myPetId')
  chatMascot(
    @CurrentUser() user: ICurrentUser,
    @Param('myPetId') myPetId: string,
    @Body() body: ChatMascotDto,
  ) {
    return this.petService.chatMascot(myPetId, user, body);
  }

  @Authorize(UserRoles.STUDENT)
  @Post('exchange/:petId')
  exchange(@CurrentUser() user: ICurrentUser) {}
}
