import { GetUser } from '@/auth/decorators/get-user.decorator';
import { FilesService } from '@/files/files.service';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import * as PostService from '@app/microservices/post';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadedPostPic } from './decorators/uploaded-post-pic.decorator';
import { CreatePostDto } from './dto/create.dto';
import { UpdatePostDto } from './dto/update.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    @InjectAppClient() private readonly client: ClientProvider,
    private readonly fileService: FilesService,
  ) {}

  @Get('user/reco')
  getPostRecoByUser(@GetUser('id') userId: number) {
    return this.client.sendAndReceive(PostService.Msg.GET_POST_RECO, userId);
  }

  @Get('user')
  getByUser(
    @GetUser('id') userId: number,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const payload: PostService.Payload.GetByUser = { userId, skip, take };
    return this.client.sendAndReceive(PostService.Msg.GET_BY_USER, payload);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @GetUser('id') userId: number,
    @Body() dto: CreatePostDto,
    @UploadedPostPic()
    file?: Express.Multer.File | Express.MulterS3.File,
  ) {
    const payload: PostService.Payload.Create = { userId, ...dto };

    if (file) {
      file.filename = `${uuidv4()}${path.extname(file.originalname)}`;
      payload.picPath = this.fileService.generatePath(file);
    }

    const response = await this.client.sendAndReceive(
      PostService.Msg.CREATE,
      payload,
    );

    file && (await this.fileService.save(file));

    return response;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdatePostDto,
    @UploadedPostPic()
    file?: Express.Multer.File | Express.MulterS3.File,
  ) {
    const payload: PostService.Payload.Update = { id, userId, ...dto };

    if (file) {
      file.filename = `${uuidv4()}${path.extname(file.originalname)}`;
      payload.picPath = this.fileService.generatePath(file);
    }

    const response = await this.client.sendAndReceive(
      PostService.Msg.UPDATE,
      payload,
    );

    file && (await this.fileService.save(file));

    return response;
  }

  @Delete(':id')
  delete(@Param('id') id: number, @GetUser('id') userId: number) {
    const payload: PostService.Payload.Delete = { id, userId };
    return this.client.sendAndReceive(PostService.Msg.DELETE, payload);
  }
}
