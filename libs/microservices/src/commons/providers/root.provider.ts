import { MongoExceptionFilter, TypeORMExceptionFilter } from '@app/common';
import { Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionFilter, TransformResponseInterceptor } from '../utils';

export const rootProviders: ReadonlyArray<Provider> = [
  { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  { provide: APP_FILTER, useClass: ExceptionFilter },
  { provide: APP_FILTER, useClass: MongoExceptionFilter },
  { provide: APP_FILTER, useClass: TypeORMExceptionFilter },
];
