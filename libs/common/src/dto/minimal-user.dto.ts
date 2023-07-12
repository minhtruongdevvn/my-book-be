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
  createdAt?: Date;

  constructor(...args: Args) {
    const {
      id,
      firstName,
      lastName,
      alias,
      createdAt,
      photo,
      photoId,
      photoPath,
    } = argsToObject(args);

    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.alias = alias;
    this.createdAt = createdAt;
    if (photo) {
      this.photo = photo;
    } else if (photoId && photoPath) {
      this.photoId = photoId;
      this.photoPath = photoPath;
    }
  }
}

// helpers
function argsIsObject(args: Args): args is ArgsObject {
  return typeof args[0] === 'object' && !args[1];
}
function argsToObject(args: Args): MinimalUserDto {
  return argsIsObject(args)
    ? args[0]
    : {
        id: args[0],
        firstName: args[1],
        lastName: args[2],
        alias: args[3],
        createdAt: args[4],
        photo: args[5],
        photoId: args[6],
        photoPath: args[7],
      };
}

type Args = ArgsObject | ArgsFlat;
type ArgsObject = [MinimalUserDto];
type ArgsFlat = [
  id: number,
  firstName: string | null,
  lastName: string | null,
  alias: string,
  createdAt?: Date,
  photo?: Photo | null,
  photoId?: string,
  photoPath?: string,
];
