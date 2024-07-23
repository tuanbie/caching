import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const CustomController = (title: string) => {
  return applyDecorators(
    Controller(title),
    ApiTags(title.toUpperCase().replaceAll('-', ' ')),
  );
};
