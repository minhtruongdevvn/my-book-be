import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostInterest } from './post-interest.entity';
import { User } from './user.entity';

@Entity()
export class Interest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.interests)
  users: User[];

  @OneToMany(() => PostInterest, (pi) => pi.interest)
  postInterests: PostInterest[];
}
