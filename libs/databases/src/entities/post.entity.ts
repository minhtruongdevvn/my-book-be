import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { Comment } from './comment.entity';
import { FileEntity } from './file.entity';
import { PostInterest } from './post-interest.entity';
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

  @OneToMany(() => PostInterest, (pi) => pi.post)
  postInterests?: PostInterest[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    nullable: true,
  })
  comments?: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
