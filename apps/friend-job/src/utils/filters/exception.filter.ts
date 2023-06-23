import { ServiceResponse } from '@app/microservices';
import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException): Observable<ServiceResponse> {
    const response: ServiceResponse = {
      error: { message: exception.getError().toString() },
    };

    return throwError(() => response);
  }
}
