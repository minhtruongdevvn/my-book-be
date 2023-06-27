import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ServiceResponse } from '../../types';

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
