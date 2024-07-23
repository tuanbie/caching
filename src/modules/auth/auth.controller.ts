import { Body, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { CustomController } from '@common/decorators/custom-controller.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ICurrentUser } from '@common/types/current-user.type';
import { Authorize } from '@common/decorators/authorize.decorator';
import { UserRoles } from '@common/constants/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { KeyCache } from '@common/providers/caching/enum/cache.enum';
import { Caching } from '@common/providers/caching/caching';
import { LoginWithTalkSam } from './dtos/login-talksam.dto';

@CustomController('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private caching: Caching,
  ) {}

  @ApiBody({
    schema: {
      example: {
        username: 'string',
        password: 'string',
      },
    },
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@CurrentUser() user: ICurrentUser) {
    return this.authService.login(user);
  }

  @Post('login-talksam')
  loginWithTalkSam(@Body() body: LoginWithTalkSam) {
    return this.authService.loginWithTalkSam(body);
  }

  @ApiBody({
    schema: {
      example: {
        refreshToken: 'string',
      },
    },
  })
  @Post('refresh')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Authorize(...Object.values(UserRoles))
  @Get('profile')
  async getProfile(@CurrentUser() user: ICurrentUser) {
    const keyProfile: string = KeyCache.PROFILE + user._id.toString();

    const cacheProfile = await this.caching.getValue(keyProfile);

    if (cacheProfile) return cacheProfile;

    const result = await this.authService.getProfile(user);

    await this.caching.setValue(keyProfile, result, 600);

    return result;
  }
}
