import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type countryDocument = HydratedDocument<Countries>;

@CustomEntity(Countries.name)
export class Countries {
  @Prop({ type: String })
  name: string;
}

export const countrySchema = SchemaFactory.createForClass(Countries);
