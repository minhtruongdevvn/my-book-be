import { ClientError } from '../enums';

export interface ClientErrorResponse {
  name: ClientError;
  description: string | object | null;
}
