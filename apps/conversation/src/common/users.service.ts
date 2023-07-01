import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getUserByRangeId(userIds: number[]): Promise<MinimalUserDto[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where({ id: In(userIds) })
      .leftJoinAndSelect('user.photo', 'photo')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.alias',
        'photo',
      ])
      .getMany();
  }
}
