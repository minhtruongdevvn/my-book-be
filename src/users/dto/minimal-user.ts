import { FileEntity } from 'src/files/entities/file.entity';

export class MinimalUser {
  id: number;
  lastName: string | null;
  firstName: string | null;
  photo?: FileEntity | null;
}
