import { MongoError } from 'mongodb';
import { DBErrorParse } from './types';

enum MongoErrorType {
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  WRITE_CONFLICT = 'WRITE_CONFLICT',
}
const MongoErrorCode = new Map<number, MongoErrorType>();
MongoErrorCode.set(11000, MongoErrorType.DUPLICATE_KEY);
MongoErrorCode.set(112, MongoErrorType.WRITE_CONFLICT);

export const parseMongoError = (exception: MongoError): DBErrorParse => {
  const errorCode = MongoErrorCode.get(exception.code as number);
  if (!errorCode) return { isInternal: true };
  return { isInternal: false, clientError: errorCode };
};
