import { ServiceResponse } from '@app/microservices';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor
  implements NestInterceptor<any, ServiceResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ServiceResponse> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
