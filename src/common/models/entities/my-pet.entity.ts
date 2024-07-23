import { CustomEntity } from '@common/decorators/custom-entity.decorator';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.entity';
import { Pets } from './pet.entity';

export type PetDocument = HydratedDocument<MyPet>;

@CustomEntity(MyPet.name)
export class MyPet {
  @Prop({ type: Types.ObjectId, ref: Users.name, index: true })
  student: Users | Types.ObjectId | string;

  @Prop({
    type: Types.ObjectId,
    ref: Pets.name,
    index: true,
    required: false,
    default: new Types.ObjectId('66947e973ee3e535b1d0bc5b'),
  })
  pet: Pets | Types.ObjectId | string;

  @Prop({ type: Number, required: false, default: 1 })
  affectionPoint: number;
}

export const MyPetSchema = SchemaFactory.createForClass(MyPet);
