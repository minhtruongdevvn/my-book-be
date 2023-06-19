import { BadRequestException } from '@nestjs/common';
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
import { BaseCollection } from '../collections/base.collection';
import { MongoRepositoryInterface } from './mongo-repository.interface';

export class MongoRepository<T extends BaseCollection>
  implements MongoRepositoryInterface<T>
{
  constructor(private readonly model: Model<T>) {}

  async create(doc: T): Promise<T> {
    const created = await this.model.create<T>(doc);
    doc._id = (await created.save()).toObject()._id;
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
      if (filter['_id']) {
        if (!ObjectId.isValid(filter['_id']))
          throw new BadRequestException('id is invalid');
      }

      result = await this.model.find(filter, projection, options).exec();
    }

    return result.map((e) => e.toObject());
  }

  async findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T | null> {
    if (filter && filter['_id']) {
      if (!ObjectId.isValid(filter['_id']))
        throw new BadRequestException('id is invalid');
    }

    const result = await this.model.findOne(filter, projection, options).exec();
    return result?.toObject() ?? null;
  }

  async updateOne(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> | null,
  ): Promise<boolean> {
    if (filter && filter['_id']) {
      if (!ObjectId.isValid(filter['_id']))
        throw new BadRequestException('id is invalid');
    }

    const updateResult = await this.model
      .updateOne(filter, update, options)
      .exec();
    return (
      updateResult.acknowledged &&
      (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0)
    );
  }

  async deleteOne(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<boolean> {
    if (filter && filter['_id']) {
      if (!ObjectId.isValid(filter['_id']))
        throw new BadRequestException('id is invalid');
    }

    const deleteResult = await this.model.deleteOne(filter, options).exec();
    return deleteResult.acknowledged && deleteResult.deletedCount > 0;
  }

  async exist(filter: FilterQuery<T>) {
    const id = await this.model.exists(filter);
    return !!id;
  }
}
