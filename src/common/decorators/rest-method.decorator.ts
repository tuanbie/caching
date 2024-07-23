import { applyDecorators, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

interface RestMethodProp {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path?: string;
  summary?: string;
}

export const RestMethod = (payload: RestMethodProp) => {
  const decorators = [];

  if (payload.summary)
    decorators.push(
      ApiOperation({
        summary: payload.summary,
      }),
    );

  const path = payload.path ? payload.path : '';

  switch (payload.method) {
    case 'GET':
      decorators.push(Get(path));
      break;

    case 'POST':
      decorators.push(Post(path));
      break;

    case 'PUT':
      decorators.push(Put(path));
      break;

    case 'PATCH':
      decorators.push(Patch(path));
      break;

    case 'DELETE':
      decorators.push(Delete(path));
      break;
  }

  return applyDecorators(...decorators);
};
