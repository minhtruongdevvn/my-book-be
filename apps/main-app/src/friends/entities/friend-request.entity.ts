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
