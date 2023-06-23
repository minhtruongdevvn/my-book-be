import { FileEntity } from '@app/databases';

export class MinimalUserDto {
  readonly id: number;
  firstName: string | null = null;
  lastName: string | null = null;
  alias: string;
  photo?: FileEntity | null = undefined;
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
    photo: FileEntity,
  );
  constructor(
    id: number,
    alias: string,
    firstName: string | null,
    lastName: string | null,
    photo?: FileEntity,
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
