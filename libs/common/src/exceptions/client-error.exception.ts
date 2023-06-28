import { BadRequestException } from '@nestjs/common';
import { ClientErrorResponse } from '../types';
import { Optional } from '../utils';

export class ClientErrorException extends BadRequestException {
  constructor(response: Optional<ClientErrorResponse, 'description'>) {
    if (response.description === undefined) response.description = null;
    super(response);
  }
}
