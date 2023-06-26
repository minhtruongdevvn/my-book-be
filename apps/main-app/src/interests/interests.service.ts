import { Interest, User } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterestCreateDto } from './dto/interest-create.dto';
import { InterestUpdateDto } from './dto/interest-update.dto';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: InterestCreateDto): Promise<Interest> {
    const interest = this.interestsRepository.create({ ...dto });
    return this.interestsRepository.save(interest);
  }

  async find(search?: string, skip = 0, take = 10): Promise<Interest[]> {
    const query = this.interestsRepository.createQueryBuilder('interest');

    if (search) {
      query.where('interest.name LIKE :search', { search: `%${search}%` });
    }

    return query.skip(skip).take(take).getMany();
  }

  async findById(id: number): Promise<Interest | null> {
    return this.interestsRepository.findOneBy({ id });
  }

  async getInterestsByUserId(userId: number): Promise<Interest[]> {
    return this.interestsRepository
      .createQueryBuilder('interest')
      .innerJoin('interest.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async update(id: number, dto: InterestUpdateDto): Promise<void> {
    await this.interestsRepository.update(id, { ...dto });
  }

  async remove(id: number): Promise<void> {
    await this.interestsRepository.delete(id);
  }

  async addUserInterests(userId: number, interestIds: number[]) {
    const values = interestIds.map((interestId) => ({ userId, interestId }));

    await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into('user_interest')
      .values(values)
      .execute();

    return values;
  }

  async removeUserInterests(userId: number, interestIds: number[]) {
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from('user_interest')
      .where('userId = :userId AND interestId IN (:...interestIds)', {
        userId,
        interestIds,
      })
      .execute();
  }
}
