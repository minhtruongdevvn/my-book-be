import {
  ClientError,
  ClientErrorResponse,
  DBErrorParse,
  parseMongoError,
  parseTypeORMError,
} from '@app/common';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { TypeORMError } from 'typeorm';

abstract class DBExceptionFilter<T extends MongoError | TypeORMError>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { isInternal, clientError } = this.parse(exception);
    if (isInternal) {
      console.log(exception);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return;
    }

    const errResponse: ClientErrorResponse = {
      name: ClientError.UnprocessableEntity,
      description: clientError ?? null,
    };
    response.status(HttpStatus.BAD_REQUEST).json(errResponse);
  }

  abstract parse(exception: T): DBErrorParse;
}

@Catch(MongoError)
export class MongoExceptionFilter extends DBExceptionFilter<MongoError> {
  parse = parseMongoError;
}

@Catch(TypeORMError)
export class TypeORMExceptionFilter extends DBExceptionFilter<TypeORMError> {
  parse = parseTypeORMError;
}
