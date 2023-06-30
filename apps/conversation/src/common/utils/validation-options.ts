import { ClientError, ClientErrorException } from '@app/common';
import {
  HttpStatus,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

export const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
  exceptionFactory: (errors: ValidationError[]) => {
    return new ClientErrorException({
      name: ClientError.InvalidPayload,
      description: errors.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.property]: Object.values(curr.constraints ?? {}).join(', '),
        }),
        {},
      ),
    });
  },
};
