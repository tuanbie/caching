import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PetDocument = HydratedDocument<Pets>;

@CustomEntity(Pets.name)
export class Pets {
  @Prop()
  name: string;

  @Prop()
  gifAvatar: string;

  @Prop()
  petAvatar: string;

  @Prop()
  pointExchange: number;

  @Prop()
  description: string;

  @Prop()
  level: string;
}

export const PetSchema = SchemaFactory.createForClass(Pets);
