import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { User } from './user.entity';

@Entity()
export class FriendRequest extends EntityHelper {
  @PrimaryColumn()
  senderId: number;

  @PrimaryColumn()
  recipientId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @CreateDateColumn()
  createdAt: Date;
}
