import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { Comment } from './comment.entity';
import { FileEntity } from './file.entity';
import { Interest } from './interest.entity';
import { User } from './user.entity';

@Entity()
export class Post extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 200 })
  title?: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  backgroundCode?: string;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  picId?: string;

  @OneToOne(() => FileEntity, (file) => file.post, {
    eager: true,
    nullable: true,
  })
  pic?: FileEntity;

  @ManyToMany(() => Interest, (interest) => interest.posts)
  interests?: Interest[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    nullable: true,
  })
  comments?: Comment[];
}
