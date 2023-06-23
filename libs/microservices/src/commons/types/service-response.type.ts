import { ErrorResponse } from '@app/common';

export type ServiceResponse<
  TData = any,
  TError extends ErrorResponse = ErrorResponse,
> = {
  data?: TData;
  error?: TError;
};
