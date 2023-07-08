import { Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  ExceptionFilter,
  TransformDBExceptionInterceptor,
  TransformResponseInterceptor,
} from '../utils';

export const rootProviders: ReadonlyArray<Provider> = [
  { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  { provide: APP_INTERCEPTOR, useClass: TransformDBExceptionInterceptor },
  { provide: APP_FILTER, useClass: ExceptionFilter },
];
