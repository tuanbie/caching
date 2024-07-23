import { UserRoles } from '@common/constants/role.enum';
import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Roles>;

@CustomEntity(Roles.name)
export class Roles {
  @Prop({ type: String, index: true })
  name: UserRoles;
}

export const RoleSchema = SchemaFactory.createForClass(Roles);
