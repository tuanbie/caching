import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { appSettings } from '@common/configs/appSetting';
import { UserService } from '@modules/user/user.service';
import { ICurrentUser } from '@common/types/current-user.type';
import { TypeJWT } from '@common/constants/jwt.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.jwt.secret,
    });
  }

  async validate(payload: ICurrentUser) {
    if (!payload.typeToken) throw new UnauthorizedException();

    if (payload.typeToken !== TypeJWT.ACCESS_TOKEN)
      throw new UnauthorizedException('Invalid type token');

    const user = await this.userService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException('Invalid type token');
    return user;
  }
}
