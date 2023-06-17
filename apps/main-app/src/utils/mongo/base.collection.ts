import { Exclude, Expose } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class BaseCollection extends Object {
  @Exclude()
  _id?: ObjectId;

  @Expose()
  public get id() {
    return this._id?.toString();
  }

  //   @Prop({ default: null })
  //   deleted_at: Date;
}
