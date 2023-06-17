import { User } from '@/users/entities/user.entity';
import { EntityHelper } from '@/utils/entity-helper';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserFriend extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user1: User;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user2: User;

  @CreateDateColumn()
  createdAt: Date;
}
