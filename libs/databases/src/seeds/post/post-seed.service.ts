import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { FileEntity, Interest, Post, PostInterest, User } from '../../entities';
import { RoleEnum } from '../../enum/roles.enum';

interface SeedData {
  title: string;
  content: string;
  pic: string;
  topic: string;
}

@Injectable()
export class PostSeedService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
    @InjectRepository(Interest)
    private interestRepo: Repository<Interest>,
    @InjectRepository(PostInterest)
    private postInterestRepo: Repository<PostInterest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  run() {
    return new Promise<void>((resolve, reject) => {
      fs.readFile(
        __dirname + '/../seed-data/post/my_book_post.json',
        'utf8',
        async (err, data) => {
          if (err) return reject(err);

          try {
            await this.postRepo.delete({});

            const seedData: SeedData[] = JSON.parse(data);
            const map = await this.getInterestInvertMap();
            const user = await this.userRepo.findOne({
              where: { role: { id: RoleEnum.admin } },
              select: ['id'],
            });
            if (!user) return;

            await Promise.all(
              seedData.map((postData) => this.insert(user, postData, map)),
            );

            return resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }

  private async insert(
    user: User,
    postData: SeedData,
    interestInvertMap: Map<string, number>,
  ) {
    const { title, content, pic, topic } = postData;

    const post = await this.postRepo.save(
      this.postRepo.create({ title, content, userId: user.id }),
    );

    const picToSave = new FileEntity();
    picToSave.path = pic;
    picToSave.post = post;

    await Promise.all([
      this.postInterestRepo.insert({
        postId: post.id,
        interestId: interestInvertMap.get(topic),
      }),
      picToSave.save(),
    ]);

    await this.postRepo.update({ id: post.id }, { picId: picToSave.id });
  }

  private async getInterestInvertMap() {
    const interests = await this.interestRepo.find();
    const invertMap = new Map<string, number>();
    for (const interest of interests) {
      invertMap.set(interest.name, interest.id);
    }

    return invertMap;
  }
}
