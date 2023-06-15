import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from 'src/utils/mongo/mongo-repository';
import { Address } from './collections/address.collection';

export class AddressRepository extends MongoRepository<Address> {
  constructor(@InjectModel(Address.name) model: Model<Address>) {
    super(model);
  }
}
