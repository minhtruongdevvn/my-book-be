import { RpcException } from '@nestjs/microservices';

export class RpcControlledException extends RpcException {
  constructor(err: string | object) {
    super({ controlled: true, error: err });
  }
}
