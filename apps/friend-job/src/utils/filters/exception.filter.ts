import { ServiceResponse } from '@app/microservices';
import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BaseRpcExceptionFilter } from '@nestjs/microservices/exceptions/base-rpc-exception-filter';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class ExceptionFilter
  extends BaseRpcExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const err = exception.getError();
    if (!err['controlled']) {
      return super.catch(exception, host);
    }

    const response: ServiceResponse = {
      error: { message: err['error'] },
    };
    return throwError(() => response);
  }
}
