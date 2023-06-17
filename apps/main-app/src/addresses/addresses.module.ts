import { IsValidAddressProvider } from '@/utils/validators/is-valid-address.validator';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesController } from './addresses.controller';
import { AddressRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { Address, AddressSchema } from './collections/address.collection';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  providers: [AddressesService, AddressRepository, IsValidAddressProvider],
  controllers: [AddressesController],
})
export class AddressesModule {}
