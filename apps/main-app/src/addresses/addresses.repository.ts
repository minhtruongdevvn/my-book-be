import { Address, MongoRepository } from '@app/databases';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class AddressRepository extends MongoRepository<Address> {
  constructor(@InjectModel(Address.name) model: Model<Address>) {
    super(model);
  }
}
