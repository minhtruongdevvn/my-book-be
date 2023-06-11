import { FileEntity } from 'src/files/entities/file.entity';

export class MinimalUser {
  id: number;
  alias: string;
  lastName: string | null;
  firstName: string | null;
  photo?: FileEntity | null;
  metadata?: { isActive?: boolean; [key: string]: any };
}
