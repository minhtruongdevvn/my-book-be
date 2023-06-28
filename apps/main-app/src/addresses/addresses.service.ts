import { ClientError, ClientErrorException } from '@app/common';
import { Address } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AddressRepository } from './addresses.repository';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private addressRepository: AddressRepository) {}

  async add(province: string, subProvince: string) {
    const isExist = await this.isExist(province, subProvince);
    if (isExist)
      throw new ClientErrorException({
        name: ClientError.Existed,
        description: 'address is exist',
      });

    const address = new Address();
    address.province = province;
    address.subProvince = subProvince;
    return await this.addressRepository.create(address);
  }

  update(id: string, dto: UpdateAddressDto) {
    return this.addressRepository.updateOne({ _id: id, ...dto });
  }

  deleteById(id: string) {
    return this.addressRepository.deleteOne({ _id: id });
  }

  deleteAddress(province: string, subProvince: string) {
    return this.addressRepository.deleteOne({ province, subProvince });
  }

  isExist(province: string, subProvince: string) {
    return this.addressRepository.exist({ province, subProvince });
  }

  async getAllSubprovince(
    province: string,
    searchTerm?: string,
  ): Promise<string[]> {
    const addresses = await this.addressRepository.find(
      {
        province,
        subProvince: searchTerm
          ? { $regex: searchTerm, $options: 'i' }
          : undefined,
      },
      { subProvince: 1 },
      { limit: 20 },
    );

    return addresses.map((e) => e.subProvince);
  }

  getProvinces(searchTerm?: string, skip?: number, limit = 20) {
    const filter: FilterQuery<Address> | undefined = searchTerm
      ? {
          province: { $regex: searchTerm, $options: 'i' },
        }
      : undefined;

    return this.addressRepository.find(filter, undefined, { skip, limit });
  }
}
