import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { addTimeFromNow } from '../date/addTime.date';

@Injectable()
export class HttpOnlyCookieInterceptor implements NestInterceptor {
  constructor(
    private readonly sets: [
      cookieKey: string,
      fieldName: string,
      expires?: Date | undefined,
    ][],
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      tap((data) => {
        for (const set of this.sets) {
          const [cookieKey, fieldName, expires] = set;

          if (data && data[fieldName]) {
            response.cookie(cookieKey, data[fieldName], {
              httpOnly: true,
              expires: expires ?? addTimeFromNow(30, 'd'),
            });
            delete data[fieldName];
          }
        }
      }),
    );
  }
}
