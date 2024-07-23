import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Countries } from './country.entity';
import { Campus } from './campus.entity';
import { Roles } from './role.entity';
import { Levels } from './level.entity';

export type UserDocument = HydratedDocument<Users>;

@CustomEntity(Users.name)
export class Users {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String, unique: true })
  username: string;

  @Prop({ type: String, select: false })
  password: string;

  @Prop({ type: String, index: true })
  fullName: string;

  @Prop({ type: Date, required: false, default: null })
  dob: Date;

  @Prop({ type: String, required: false, default: null })
  avatar: string;

  @Prop({ type: String, required: false, default: null, index: true })
  talkSamId: string;

  @Prop({ type: Boolean, required: false, default: true, index: true })
  member: string;

  @Prop({ type: Boolean, required: false, default: false, index: true })
  withdraw: string;

  @Prop({ type: Types.ObjectId, ref: Countries.name, index: true })
  country: Countries | Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Campus.name, index: true })
  campus: Campus | Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Roles.name, index: true })
  role: Roles;

  @Prop({
    type: Types.ObjectId,
    ref: Levels.name,
    required: false,
    default: null,
    index: true,
  })
  level: Levels;
}

export const UserSchema = SchemaFactory.createForClass(Users);
UserSchema.pre('findOne', function (next) {
  this.select('+password');
  next();
});
