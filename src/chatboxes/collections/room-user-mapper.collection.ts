import { Exclude, Expose } from 'class-transformer';
import { EntityHelper } from 'src/utils/entity-helper';
import { Client } from 'src/utils/types/chatbox/client.type';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class RoomUserMapper extends EntityHelper {
  @ObjectIdColumn()
  @Exclude()
  _id: ObjectId;

  @Expose()
  get id() {
    return this._id.toString();
  }

  @Column(() => Client, { array: true })
  clients: Client[];
}
