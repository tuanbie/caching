import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Countries } from './country.entity';

export type CampusDocument = HydratedDocument<Campus>;

@CustomEntity(Campus.name)
export class Campus {
  @Prop({ type: String, index: true })
  name: string;

  @Prop({ type: String, index: true })
  koreaName: string;

  @Prop({ type: String, index: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: Countries.name, index: true })
  country: Countries | Types.ObjectId | string;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
