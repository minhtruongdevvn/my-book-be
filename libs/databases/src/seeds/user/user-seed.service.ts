import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEnum } from '../../enum/roles.enum';
import { StatusEnum } from '../../enum/statuses.enum';
import { User } from '../@app/databases';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password: 'secret',
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          alias: 'example:admin',
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      const seedUsers: Partial<User>[] = [
        { firstName: 'Thorfinn', lastName: 'Karlsefni', alias: 'thor_karl' },
        { firstName: 'John', lastName: 'Doe', alias: 'join_doe_46' },
        { firstName: 'Anthony', lastName: 'Dev Foo', alias: 'Anthony_DEV' },
        { firstName: 'Floyd', lastName: 'Oliver', alias: 'floyd_oliver' },
        { firstName: 'Todd', lastName: 'Moody', alias: 'todd_pike_mill_554' },
      ];

      let count = 0;
      for (const schemeUser of seedUsers) {
        await this.repository.save(
          this.repository.create({
            ...schemeUser,
            email: `user${count ? `_${count}` : ''}@mail.com`,
            password: 'pass123',
            address: 'ho chi minh, binh thanh',
            role: { id: RoleEnum.user, name: 'User' },
            status: { id: StatusEnum.active, name: 'Active' },
          }),
        );
        count++;
      }
    }
  }
}
