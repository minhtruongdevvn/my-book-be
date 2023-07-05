import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../utils/entity-helper';
import { Comment } from './comment.entity';
import { FileEntity } from './file.entity';
import { Interest } from './interest.entity';

@Entity()
export class Post extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 200 })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  backgroundCode: string;

  @Column({ nullable: true })
  picId: string;

  @OneToOne(() => FileEntity, { eager: true, cascade: true, nullable: true })
  @JoinColumn({ name: 'picId' })
  pic: FileEntity;

  @ManyToMany(() => Interest, (interest) => interest.posts)
  interests: Interest[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    nullable: true,
  })
  comments: Comment[];
}
