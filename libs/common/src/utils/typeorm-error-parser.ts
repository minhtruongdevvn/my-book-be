import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';
import { DBErrorParse } from './types';

enum MongoErrorType {
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  WRITE_CONFLICT = 'WRITE_CONFLICT',
}
const MongoErrorCode = new Map<number, MongoErrorType>();
MongoErrorCode.set(11000, MongoErrorType.DUPLICATE_KEY);
MongoErrorCode.set(112, MongoErrorType.WRITE_CONFLICT);

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
