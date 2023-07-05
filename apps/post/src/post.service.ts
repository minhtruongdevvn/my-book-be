import { ClientError } from '@app/common';
import { Post as PostEntity } from '@app/databases';
import { RpcControlledException } from '@app/microservices';
import * as Post from '@app/microservices/post';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  async getByUser(payload: Post.Payload.GetByUser) {
    const result = await this.postRepo.findAndCount({
      where: { userId: payload.userId },
      skip: payload.skip,
      take: payload.take ?? 10,
    });

    const [posts, count] = result;
    return { posts, count };
  }

  create(payload: Post.Payload.Create) {
    return this.postRepo.save(
      this.postRepo.create(payload as unknown as PostEntity),
    );
  }

  async update(payload: Post.Payload.Update) {
    const isExists = await this.postRepo.exist({
      where: { id: payload.id, userId: payload.userId },
    });
    if (!isExists) {
      throw new RpcControlledException({
        name: ClientError.UnprocessableEntity,
        description: `user with ID: ${payload.userId} does not has the post`,
      });
    }

    return this.postRepo.save(payload as unknown as PostEntity);
  }

  async delete(payload: Post.Payload.Delete) {
    const result = await this.postRepo.delete({
      id: payload.id,
      userId: payload.userId,
    });

    return result.affected ? result.affected > 0 : false;
  }
}
