import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { RecommendationType } from '../types';

export class UserProvinceProvider {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  public async getProvinceAndSub(user: User): Promise<MinimalUserDto[]> {
    const userFriends = await this.userRepo.find({
      where: { address: user.address, id: Not(user.id) },
      select: ['id', 'lastName', 'firstName', 'alias'],
      relations: ['photo'],
    });

    return userFriends.map((e) => ({
      ...e,
      metadata: { type: RecommendationType.province },
    }));
  }

  public getProvince(user: User) {
    return this.userRepo.find({
      where: { address: Like(`${user.address.split(', ')[0]}, %`) },
      select: ['id', 'lastName', 'firstName', 'alias'],
      relations: ['photo'],
    });
  }
}
