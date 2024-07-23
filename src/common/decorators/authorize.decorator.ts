import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Roles } from './role.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UserRoles } from '@common/constants/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Authorize = (...args: UserRoles[]) => {
  return applyDecorators(
    ApiBearerAuth(),
    Roles(...args),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
};
