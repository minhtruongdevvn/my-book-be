import { User } from '@app/databases';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  refresh: string;
  iat: number;
  exp: number;
};
