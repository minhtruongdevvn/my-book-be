import { ClientError, ClientErrorResponse } from '@app/common';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = exception['detail'];
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    switch (exception.constructor) {
      case QueryFailedError:
      case EntityNotFoundError:
      case CannotCreateEntityIdMapError:
        status = HttpStatus.BAD_REQUEST;
        message =
          exception['detail']?.replace(/table|"\w+"|[. ]$|\(|\)/g, '').trim() ??
          '';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.log(exception);
      response.status(status);
      return;
    }

    const errResponse: ClientErrorResponse = {
      name: ClientError.UnprocessableEntity,
      description: message,
    };

    response.status(status).json(errResponse);
  }
}
