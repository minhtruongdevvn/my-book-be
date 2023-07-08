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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payload: PostService.Payload.Create = {
      userId,
      ...dto,
      picPath: file ? this.fileService.generatePath(file) : undefined,
    };

    return await this.client.sendAndReceive(PostService.Msg.CREATE, payload);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payload: PostService.Payload.Update = {
      id,
      userId,
      ...dto,
      picPath: file ? this.fileService.generatePath(file) : undefined,
    };

    return await this.client.sendAndReceive(PostService.Msg.UPDATE, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @GetUser('id') userId: number) {
    const payload: PostService.Payload.Delete = { id, userId };
    return this.client.sendAndReceive(PostService.Msg.DELETE, payload);
  }
}
