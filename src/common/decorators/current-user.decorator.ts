import { ExecutionContext, createParamDecorator } from '@nestjs/common';

interface ICurrentUser {}

export const CurrentUser = createParamDecorator<ICurrentUser>(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as ICurrentUser;
    return user;
  },
);
