import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '@common/constants/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
