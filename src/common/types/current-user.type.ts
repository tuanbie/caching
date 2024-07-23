import { TypeJWT } from '@common/constants/jwt.enum';
import { Users } from '@common/models/entities/user.entity';
import { Types } from 'mongoose';

export interface ICurrentUser extends Users {
  _id: Types.ObjectId;
  typeToken?: TypeJWT;
}
