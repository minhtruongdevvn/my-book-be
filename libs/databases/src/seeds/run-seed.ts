import { NestFactory } from '@nestjs/core';
import { AddressSeedService } from './address/address-seed.service';
import { InterestSeedService } from './interest/interest-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserFriendSeedService } from './user-friend/user-friend-seed.service';
import { UserSeedService } from './user/user-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(UserFriendSeedService).run();
  await app.get(AddressSeedService).run();
  await app.get(InterestSeedService).run();
  await app.close();
};

void runSeed();
