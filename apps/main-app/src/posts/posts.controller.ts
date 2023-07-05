import { GetUser } from '@/auth/decorators/get-user.decorator';
import { FilesService } from '@/files/files.service';
import { FileEntity } from '@app/databases';
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
    private readonly filesService: FilesService,
  ) {}

  @Get('user/:userId')
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
    @Body('dto') dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileInfo: FileEntity | undefined = undefined;
    if (file) {
      fileInfo = await this.filesService.uploadFile(file);
    }
    const payload: PostService.Payload.Create = {
      userId,
      ...dto,
      picId: fileInfo?.id,
    };

    return await this.client.sendAndReceive(PostService.Msg.CREATE, payload);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @GetUser('id') userId: number,
    @Body('dto') dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileInfo: FileEntity | undefined = undefined;
    if (file) {
      fileInfo = await this.filesService.uploadFile(file);
    }
    const payload: PostService.Payload.Update = {
      id,
      userId,
      ...dto,
      picId: fileInfo?.id,
    };

    return await this.client.sendAndReceive(PostService.Msg.UPDATE, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @GetUser('id') userId: number) {
    const payload: PostService.Payload.Delete = { id, userId };
    return this.client.sendAndReceive(PostService.Msg.DELETE, payload);
  }
}
