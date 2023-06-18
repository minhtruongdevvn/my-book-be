import { User } from '@/users/entities/user.entity';
import { EntityHelper } from '@/utils/entity-helper';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
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
