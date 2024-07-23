import { appSettings } from '@common/configs/appSetting';
import { TypeJWT } from '@common/constants/jwt.enum';
import { MyPet } from '@common/models/entities/my-pet.entity';
import { Users } from '@common/models/entities/user.entity';
import { ICurrentUser } from '@common/types/current-user.type';
import { compareHash } from '@common/utils/hashing.util';
import { UserService } from '@modules/user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginWithTalkSam } from './dtos/login-talksam.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private httpService: HttpService,
    @InjectModel(MyPet.name) private myPetModel: Model<MyPet>,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<{
    user: Omit<Users, 'password'> | null;
    errMessage: string | null;
  }> {
    let errMessage = null;
    const user = await this.userService.findUser(username);
    if (user) {
      const isMatchPassword = await compareHash<String>(user.password, pass);
      if (!isMatchPassword) {
        errMessage = 'Password is incorrect';
        return { user: null, errMessage };
      }
      const { password, ...result } = user.toObject();

      if (result.withdraw) {
        errMessage = 'This student has reserved';
        return { user: null, errMessage };
      }

      return { user: result, errMessage };
    }
    errMessage = 'User not found';
    return { user: null, errMessage };
  }

  async autoGenerateToken(payload: any) {
    const payloadAccess = { typeToken: TypeJWT.ACCESS_TOKEN, ...payload };
    const payloadRefresh = { typeToken: TypeJWT.REFRESH_TOKEN, ...payload };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payloadAccess),
      this.jwtService.signAsync(payloadRefresh, {
        expiresIn: appSettings.jwt.expiresInRefresh,
      }),
    ]);

    return {
      accessToken: {
        token: accessToken,
        expiresIn: appSettings.jwt.expiresIn,
      },
      refreshToken: {
        token: refreshToken,
        expiresIn: appSettings.jwt.expiresInRefresh,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const verify: ICurrentUser = await this.jwtService
      .verifyAsync(refreshToken)
      .catch((err) => {
        throw new BadRequestException(err.message);
      });

    if (verify.typeToken !== TypeJWT.REFRESH_TOKEN)
      throw new BadRequestException('Token expired or invalid');

    const user = await this.userService.findUser(verify.email);
    const { email } = user.toObject();

    const token = await this.autoGenerateToken({ email });

    return token;
  }

  async login(result: ICurrentUser) {
    if (result.withdraw)
      throw new BadRequestException('This student has reserved');

    const payload = {
      email: result.email,
    };

    const [token, updateMyPet] = await Promise.all([
      this.autoGenerateToken(payload),
      this.myPetModel.updateMany(
        {
          student: result._id,
        },
        {
          $inc: {
            affectionPoint: 1,
          },
        },
      ),
    ]);

    return {
      user: result,
      token,
    };
  }

  async getProfile(user: ICurrentUser) {
    return await this.userService.getProfile(user);
  }

  async loginWithTalkSam(body: LoginWithTalkSam) {
    const { talkSamId, password } = body;

    const form = new FormData();
    form.append('tmbid', talkSamId);
    form.append('tmbpw', password);
    form.append('apikey', 'newtalksam');
    form.append('target', 'talklogin');

    const res = await this.httpService.axiosRef.post(
      `${appSettings.talkSam.apiUrl}/apiCallTalkLogin.php`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const data = res.data;

    if (data.length === 0) throw new BadRequestException('User not found');

    const checkUser = await this.userService.checkTalkSamId(talkSamId);
    if (!checkUser)
      throw new BadRequestException(
        'The student’s learning information cannot be found. Please contact the academy director.',
      );
    if (checkUser.withdraw)
      throw new BadRequestException('This student has reserved');

    return await this.login(checkUser);
  }
}
