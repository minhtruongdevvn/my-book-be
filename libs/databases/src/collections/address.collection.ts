import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseCollection } from './base.collection';

export type AddressDocument = HydratedDocument<Address>;

@Schema({
  collection: 'address',
  versionKey: false,
})
export class Address extends BaseCollection {
  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  subProvince: string;
}

const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ province: 1, subProvince: 1 }, { unique: true });
AddressSchema.index({ province: 1 });
AddressSchema.index({ subProvince: 1 });

AddressSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export { AddressSchema };
