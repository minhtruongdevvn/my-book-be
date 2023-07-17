import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';
import { DBErrorParse } from './types';

export const parseTypeORMError = (exception: TypeORMError): DBErrorParse => {
  switch (exception.constructor) {
    case QueryFailedError:
    case EntityNotFoundError:
    case CannotCreateEntityIdMapError:
      return {
        isInternal: false,
        clientError:
          exception['detail']?.replace(/table|"\w+"|[. ]$|\(|\)/g, '').trim() ??
          '',
      };

    default:
      return { isInternal: true };
  }
};
