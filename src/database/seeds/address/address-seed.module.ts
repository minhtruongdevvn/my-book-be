import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressRepository } from 'src/addresses/addresses.repository';
import {
  Address,
  AddressSchema,
} from 'src/addresses/collections/address.collection';
import { AddressSeedService } from './address-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  providers: [AddressSeedService, AddressRepository],
  exports: [AddressSeedService],
})
export class AddressSeedModule {}
