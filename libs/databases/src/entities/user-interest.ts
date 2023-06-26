import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { Interest } from './interest.entity';
import { User } from './user.entity';

@Entity()
export class UserInterest extends EntityHelper {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  interestId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Interest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interestId' })
  interest: Interest;
}
