import { ClientError, ClientErrorException } from '@app/common';
import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response as ResponseType } from 'express';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | Express.MulterS3.File,
  ) {
    await this.filesService.saveFile(file);
    return this.filesService.createFileEntity(file);
  }

  @Get(':fileName')
  download(
    @Param('fileName') fileName: string,
    @Response() response: ResponseType,
  ) {
    const filePath = this.filesService.getFilePath(fileName);
    if (!filePath) {
      throw new ClientErrorException({
        name: ClientError.NotFound,
        description: 'path not exist',
      });
    }

    return response.sendFile(filePath);
  }
}
