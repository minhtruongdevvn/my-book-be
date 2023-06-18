import { User } from '@app/databases';

export type LoginResponseType = Readonly<{
  token: string;
  user: User;
  refresh: string;
}>;
