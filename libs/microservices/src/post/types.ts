import { Post } from '@app/databases';

export interface DeleteResult {
  deleted: boolean;
  deletedPost?: Post | null;
}
