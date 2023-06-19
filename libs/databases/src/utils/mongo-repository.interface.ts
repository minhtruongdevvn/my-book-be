import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

export interface MongoRepositoryInterface<T> {
  create(doc: T): Promise<T>;
  find(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T[]>;
  findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T | null>;
  updateOne(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> | null,
  ): Promise<boolean>;
  deleteOne(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<boolean>;
}
