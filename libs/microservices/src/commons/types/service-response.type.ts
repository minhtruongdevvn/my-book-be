import { ClientErrorResponse } from '@app/common';

export type ServiceResponse<TData = any> = {
  data?: TData;
  error?: ClientErrorResponse;
};
