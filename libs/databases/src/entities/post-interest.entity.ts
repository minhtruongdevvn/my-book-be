import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { Interest } from './interest.entity';
import { Post } from './post.entity';

@Entity()
export class PostInterest extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  interestId: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Interest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interestId' })
  interest: Interest;
}
