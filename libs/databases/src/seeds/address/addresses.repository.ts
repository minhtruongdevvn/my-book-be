import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from '../../utils/mongo-repository';
import { Address } from '../.@app/databases';

export class AddressRepository extends MongoRepository<Address> {
  constructor(@InjectModel(Address.name) model: Model<Address>) {
    super(model);
  }
}
