import { FileEntity } from '@app/databases';

type Photo = Pick<FileEntity, 'id' | 'path'>;
export class MinimalUserDto {
  readonly id: number;
  firstName: string | null = null;
  lastName: string | null = null;
  alias: string;
  photo?: Photo | null;
  photoId?: string;
  photoPath?: string;
  metadata?: { isActive?: boolean; [key: string]: any };

  constructor(
    id: number,
    firstName: string | null,
    lastName: string | null,
    alias: string,
  );
  constructor(
    id: number,
    firstName: string | null,
    lastName: string | null,
    alias: string,
    photo?: Photo | null,
  );
  constructor(
    id: number,
    alias: string,
    firstName: string | null,
    lastName: string | null,
    photo?: Photo,
    photoId?: string,
    photoPath?: string,
  ) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.alias = alias;
    if (photo) {
      this.photo = photo;
    } else if (photoId && photoPath) {
      this.photoId = photoId;
      this.photoPath = photoPath;
    }
  }
}
