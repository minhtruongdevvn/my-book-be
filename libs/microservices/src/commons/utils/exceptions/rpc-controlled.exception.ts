import { ClientErrorResponse, Optional } from '@app/common';
import { RpcException } from '@nestjs/microservices';

export class RpcControlledException extends RpcException {
  constructor(err: Optional<ClientErrorResponse, 'description'>) {
    if (err.description === undefined) err.description = null;
    super({ controlled: true, error: err });
  }
}
