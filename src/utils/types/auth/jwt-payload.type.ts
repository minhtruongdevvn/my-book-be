import { User } from '../../../users/entities/user.entity';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  refresh: string;
  iat: number;
  exp: number;
};
