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
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      return;
    }

    const response = {
      error: 'DB_CONSTRAINT',
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode,
    };
    httpAdapter.reply(ctx.getResponse(), response, response.statusCode);
  }
}
