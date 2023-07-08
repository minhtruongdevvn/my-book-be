import { ClientError, ClientErrorResponse } from '@app/common';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { MongoError } from 'mongodb';

enum MongoErrorType {
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  WRITE_CONFLICT = 'WRITE_CONFLICT',
}
const MongoErrorCode = new Map<number, MongoErrorType>();
MongoErrorCode.set(11000, MongoErrorType.DUPLICATE_KEY);
MongoErrorCode.set(112, MongoErrorType.WRITE_CONFLICT);

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: MongoError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const errorCode = MongoErrorCode.get(exception.code as number);
    if (!errorCode) {
      console.log(exception);
      httpAdapter.reply(
        ctx.getResponse(),
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      return;
    }

    const response: ClientErrorResponse = {
      name: ClientError.UnprocessableEntity,
      description: errorCode,
    };
    httpAdapter.reply(ctx.getResponse(), response, HttpStatus.BAD_REQUEST);
  }
}
