import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BaseRpcExceptionFilter } from '@nestjs/microservices/exceptions/base-rpc-exception-filter';
import { Observable, throwError } from 'rxjs';
import { ServiceResponse } from '../../types';

@Catch()
export class ExceptionFilter
  extends BaseRpcExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (exception instanceof RpcException) {
      const err = exception.getError();
      if (!err['client']) {
        return super.catch(exception, host);
      }

      const response: ServiceResponse = {
        error: err['error'],
      };
      return throwError(() => response);
    }

    return super.catch(exception, host);
  }
}
