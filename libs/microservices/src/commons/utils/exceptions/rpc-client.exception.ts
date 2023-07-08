import { ClientErrorResponse, Optional } from '@app/common';
import { RpcException } from '@nestjs/microservices';

export class RpcClientException extends RpcException {
  constructor(err: Optional<ClientErrorResponse, 'description'>) {
    if (err.description === undefined) err.description = null;
    super({ client: true, error: err });
  }
}
