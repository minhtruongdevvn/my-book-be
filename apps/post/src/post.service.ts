import { ClientError } from '@app/common';
import { FileEntity, Post as PostEntity, PostInterest } from '@app/databases';
import { RpcClientException } from '@app/microservices';
import * as Post from '@app/microservices/post';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(PostInterest)
    private readonly postInterestRepo: Repository<PostInterest>,
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
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

  async create(payload: Post.Payload.Create) {
    const { interests, picPath, ...postToAdd } = payload;
    const post = await this.postRepo.save(this.postRepo.create(postToAdd));
    const postPic: FileEntity = new FileEntity();

    await Promise.all([
      (async () => {
        if (interests) {
          await this.postInterestRepo.insert(
            interests.map((interestId) => ({
              postId: post.id,
              interestId,
            })),
          );
        }
      })(),
      (async () => {
        if (picPath) {
          postPic.path = picPath;
          postPic.post = post;
          await postPic.save();
          await this.postRepo.update({ id: post.id }, { picId: postPic.id });
        }
      })(),
    ]);

    post.picId = postPic.id;
    return post;
  }

  async update(payload: Post.Payload.Update) {
    const isExists = await this.postRepo.exist({
      where: { id: payload.id, userId: payload.userId },
    });
    if (!isExists) {
      throw new RpcClientException({
        name: ClientError.UnprocessableEntity,
        description: `user with ID: ${payload.userId} does not has the post`,
      });
    }

    const { interests, picPath, ...postToUpdate } = payload;
    const postPic: FileEntity = new FileEntity();

    await Promise.all([
      (async () => {
        if (interests) {
          await this.postInterestRepo.delete({ postId: postToUpdate.id });
          await this.postInterestRepo.insert(
            interests.map((interestId) => ({
              postId: postToUpdate.id,
              interestId,
            })),
          );
        }
      })(),
      (async () => {
        if (picPath) {
          const postToUpdatePic = new PostEntity();
          postToUpdatePic.id = postToUpdate.id;

          await this.fileRepo.delete({ post: { id: postToUpdate.id } });

          postPic.path = picPath;
          postPic.post = postToUpdatePic;
          await postPic.save();
          await this.postRepo.update(
            { id: postToUpdate.id },
            { picId: postPic.id },
          );
        }
      })(),
    ]);

    const updatedPost = await this.postRepo.save(postToUpdate);

    updatedPost.picId = postPic.id;
    return updatedPost;
  }

  async delete(payload: Post.Payload.Delete): Promise<Post.Type.DeleteResult> {
    const postToDelete = await this.postRepo.findOne({
      where: { id: payload.id, userId: payload.userId },
    });

    const result = await this.postRepo.delete({
      id: payload.id,
      userId: payload.userId,
    });

    return {
      deleted: result.affected ? result.affected > 0 : false,
      deletedPost: postToDelete,
    };
  }
}
