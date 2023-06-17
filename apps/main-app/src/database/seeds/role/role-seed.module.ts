import { Role } from '@/roles/entities/role.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeedService } from './role-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleSeedService],
  exports: [RoleSeedService],
})
export class RoleSeedModule {}
