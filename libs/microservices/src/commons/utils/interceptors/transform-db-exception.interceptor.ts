import {
  ClientError,
  DBErrorParse,
  parseMongoError,
  parseTypeORMError,
} from '@app/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { catchError, Observable } from 'rxjs';
import { TypeORMError } from 'typeorm';
import { RpcClientException } from '../exceptions/rpc-client.exception';

@Injectable()
export class TransformDBExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let parseError: (exception: MongoError | TypeORMError) => DBErrorParse;
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof MongoError) parseError = parseMongoError;
        else if (error instanceof TypeORMError) parseError = parseTypeORMError;
        else throw error;

        const { isInternal, clientError } = parseError(error);
        if (isInternal) throw error;

        throw new RpcClientException({
          name: ClientError.UnprocessableEntity,
          description: clientError,
        });
      }),
    );
  }
}
