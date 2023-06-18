import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from '../../collections/address.collection';
import { MongoRepository } from '../../utils/mongo-repository';

export class AddressRepository extends MongoRepository<Address> {
  constructor(@InjectModel(Address.name) model: Model<Address>) {
    super(model);
  }
}
