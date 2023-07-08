import { ClientError, ClientErrorException } from '@app/common';
import { ParseFilePipe, UploadedFile } from '@nestjs/common';
import { FileTypeValidator } from '../validators/file-type.validator';

export const UploadedPostPic = () =>
  UploadedFile(
    new ParseFilePipe({
      validators: [new FileTypeValidator({})],
      exceptionFactory: (error: string) =>
        new ClientErrorException({
          name: ClientError.InvalidPayload,
          description: error,
        }),
    }),
  );
