export enum ClientError {
  /** not found something that is expected to be found */
  NotFound = 'not_found',
  /** client request payload invalid */
  InvalidPayload = 'invalid_payload',
  /** client request with valid payload, but the payload is unprocessable base on app logic*/
  UnprocessableEntity = 'unprocessable_entity',
  /** something existed that is expected not to exist */
  Existed = 'existed',
}
