import { MinimalUserDto } from '@app/common';
import { InternalServerErrorException } from '@nestjs/common';

export class Person extends MinimalUserDto {
  private internalFriendIds = new Set<number>();
  get friendIds() {
    return this.internalFriendIds;
  }

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
    photoId?: string,
    photoPath?: string,
  );
  constructor(
    id: number,
    firstName: string,
    lastName: string,
    alias: string,
    photoId?: string,
    photoPath?: string,
  ) {
    super(id, firstName, lastName, alias);
    if (photoId && photoPath) {
      this.photoId = photoId;
      this.photoPath = photoPath;
    }
  }

  setFriendIds(friendIds: Set<number>) {
    this.internalFriendIds = friendIds;
  }

  static fromObject(objectFrom: any) {
    const { id, firstName, lastName, alias, photoId, photoPath } = objectFrom;
    if (!(id && firstName && lastName && alias)) {
      throw new InternalServerErrorException(
        'cannot create person from object:',
        objectFrom,
      );
    }

    return new Person(id, firstName, lastName, alias, photoId, photoPath);
  }

  static createUser({
    id,
    lastName,
    firstName,
    alias,
    photoId,
    photoPath,
  }: Person) {
    const user = new MinimalUserDto(id, firstName, lastName, alias);
    if (photoId && photoPath) {
      user.photoId = photoId;
      user.photoPath = photoPath;
    }

    return user;
  }

  static fromUser(user?: MinimalUserDto | null) {
    if (!user) return undefined;

    return new Person(
      user.id,
      user.firstName,
      user.lastName,
      user.alias,
      user.photo?.id,
      user.photo?.path,
    );
  }
}
