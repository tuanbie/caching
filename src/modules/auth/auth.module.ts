import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { appSettings } from '@common/configs/appSetting';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from '@modules/user/user.service';
import { ModelsModule } from '@common/models/models.module';
import { LocalStrategy } from './strategies/local.strategy';
import { Logging } from '@common/providers/logging/logging';
import { PointService } from '@modules/point/point.service';
import { CachingModule } from '@common/providers/caching/caching.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ModelsModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: appSettings.jwt.secret,
      signOptions: { expiresIn: appSettings.jwt.expiresIn },
    }),
    CachingModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    LocalStrategy,
    Logging,
    PointService,
  ],
})
export class AuthModule {}
