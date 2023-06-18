import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../../collections/address.collection';
import { AddressSeedService } from './address-seed.service';
import { AddressRepository } from './addresses.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  providers: [AddressSeedService, AddressRepository],
  exports: [AddressSeedService],
})
export class AddressSeedModule {}
