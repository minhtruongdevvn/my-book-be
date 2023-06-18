import { EntityCondition } from '@/utils/types/entity-condition.type';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import { User } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { NullableType } from '../utils/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { MinimalUser } from './dto/minimal-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createProfileDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create(createProfileDto),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  getUserByRangeId(userIds: number[]): Promise<MinimalUser[]> {
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

  update(id: number, payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async softDelete(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
