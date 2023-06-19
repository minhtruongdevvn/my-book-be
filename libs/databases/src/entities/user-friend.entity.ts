import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { User } from './user.entity';

@Entity()
@Index(['user1Id'])
@Index(['user2Id'])
export class UserFriend extends EntityHelper {
  @PrimaryColumn()
  user1Id: number;

  @PrimaryColumn()
  user2Id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @CreateDateColumn()
  createdAt: Date;
}
