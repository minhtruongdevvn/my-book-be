import { ClientError, ClientErrorException } from '@app/common';
import { ObjectId } from 'mongodb';
import {
  FilterQuery,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { MongoRepositoryInterface } from './mongo-repository.interface';

export class MongoRepository<T> implements MongoRepositoryInterface<T> {
  constructor(private readonly model: Model<T>) {}

  startSession() {
    return this.model.startSession();
  }

  async create(doc: T): Promise<T> {
    const created = await this.model.create<T>(doc);
    doc['_id'] = created.toObject()._id;
    return doc;
  }

  async insertMany(docs: T[]): Promise<void> {
    await this.model.insertMany(docs);
  }

  async find(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T[]> {
    let result: HydratedDocument<T>[];

    if (!filter) {
      result = await this.model.find({}, projection, options).exec();
    } else {
      this.validateObjectId(filter);

      result = await this.model.find(filter, projection, options).exec();
    }

    return result.map((e) => e.toObject());
  }

  async findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T | null> {
    this.validateObjectId(filter);

    const result = await this.model.findOne(filter, projection, options).exec();
    return result?.toObject() ?? null;
  }

  async updateOne(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> | null,
  ): Promise<boolean> {
    this.validateObjectId(filter);

    const updateResult = await this.model
      .updateOne(filter, update, options)
      .exec();
    return (
      updateResult.acknowledged &&
      (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0)
    );
  }

  async updateMany(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> | null,
  ) {
    this.validateObjectId(filter);

    await this.model.updateMany(filter, update, options);
  }

  async deleteOne(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<boolean> {
    this.validateObjectId(filter);

    const deleteResult = await this.model.deleteOne(filter, options).exec();
    return deleteResult.acknowledged && deleteResult.deletedCount > 0;
  }

  async exist(filter: FilterQuery<T>) {
    const id = await this.model.exists(filter);
    return !!id;
  }

  count(filter?: FilterQuery<T>) {
    return this.model.count(filter);
  }

  private validateObjectId(filter?: FilterQuery<T>) {
    if (filter && filter['_id']) {
      if (!ObjectId.isValid(filter['_id']))
        throw new ClientErrorException({
          name: ClientError.InvalidPayload,
          description: 'id is invalid',
        });
    }
  }
}
