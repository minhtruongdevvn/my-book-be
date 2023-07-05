import * as Post from '@app/microservices/post';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PostService } from './post.service';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern(Post.Msg.GET_BY_USER)
  getByUser(payload: Post.Payload.GetByUser) {
    return this.postService.getByUser(payload);
  }

  @MessagePattern(Post.Msg.CREATE)
  create(payload: Post.Payload.Create) {
    return this.postService.create(payload);
  }

  @MessagePattern(Post.Msg.UPDATE)
  update(payload: Post.Payload.Update) {
    return this.postService.update(payload);
  }

  @MessagePattern(Post.Msg.DELETE)
  delete(payload: Post.Payload.Delete) {
    return this.postService.delete(payload);
  }
}
