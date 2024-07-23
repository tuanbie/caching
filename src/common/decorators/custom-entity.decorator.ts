import { Schema } from '@nestjs/mongoose';
import { camelCase } from 'lodash';

export const CustomEntity = (name: string) =>
  Schema({
    collection: camelCase(name),
    timestamps: true,
  });
