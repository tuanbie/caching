import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export const ApiEnumExample = (o: { [s: string]: unknown }) => {
  return 'Enum => ' + `${Object.values(o)}`.replaceAll(',', ' | ');
};

export const TransformObjectId = () =>
  Transform((param) => new Types.ObjectId(param.value));

export const TransformObjectIds = () =>
  Transform((param) => {
    if (param.value === null) return [];
    if (!Array.isArray(param.value)) return [new Types.ObjectId(param.value)];

    return param.value.map((item) => new Types.ObjectId(item));
  });

export const TransformArrayQueryObjectIds = () =>
  Transform((param) => {
    const value = param.value as string;

    return value.split(',').map((item) => new Types.ObjectId(item));
  });
