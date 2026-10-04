import {
    CreateOptions,
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryFilter,
    QueryOptions,
    Types,
    UpdateQuery,
    UpdateResult
} from 'mongoose';

import { NotFoundResponse } from '../../common/response';

export abstract class BaseRepositry<T> {

    constructor(
        private model: Model<T>,
        private entityName: string
    ) { }

    // =========================
    // CREATE
    // =========================

    create({
        data,
        options,
    }: {
        data: Partial<T>;
        options?: CreateOptions;
    }): Promise<HydratedDocument<T>>;

    create({
        data,
        options,
    }: {
        data: Partial<T>[];
        options?: CreateOptions;
    }): Promise<HydratedDocument<T>[]>;

    create({
        data,
        options,
    }: {
        data: Partial<T> | Partial<T>[];
        options?: CreateOptions;
    }): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
        return this.model.create(data as any, options);
    }


    // =========================
    // FIND ONE
    // =========================

    findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: false }
    }): Promise<HydratedDocument<T> | null>;

    findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: true }
    }): Promise<FlattenMaps<T> | null>;

    findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
        const query = this.model.findOne(
            filter,
            projection,
            options
        );

        return query.exec();
    }


    // =========================
    // FIND
    // =========================

    find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: false }
    }): Promise<HydratedDocument<T>[]>;

    find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: true }
    }): Promise<FlattenMaps<T>[]>;

    find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T>[] | FlattenMaps<T>[]> {
        const query = this.model.find(
            filter,
            projection,
            options
        );

        return query.exec();
    }


    // =========================
    // FIND BY ID
    // =========================

    findById({
        id,
        projection,
        options
    }: {
        id: Types.ObjectId,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: false }
    }): Promise<HydratedDocument<T> | null>;

    findById({
        id,
        projection,
        options
    }: {
        id: Types.ObjectId,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T> & { lean: true }
    }): Promise<FlattenMaps<T> | null>;

    findById({
        id,
        projection,
        options
    }: {
        id: Types.ObjectId,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
        const query = this.model.findById(
            id,
            projection,
            options
        );

        return query.exec();
    }


    // =========================
    // UPDATE ONE
    // =========================

    updateOne({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: MongooseUpdateQueryOptions
    }): Promise<UpdateResult> {
        return this.model.updateOne(filter, update, options);
    }


    // =========================
    // UPDATE MANY
    // =========================

    updateMany({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: MongooseUpdateQueryOptions
    }): Promise<UpdateResult> {
        return this.model.updateMany(filter, update, options);
    }


    // =========================
    // DELETE ONE
    // =========================

    deleteOne({
        filter
    }: {
        filter: QueryFilter<T>
    }): Promise<DeleteResult> {
        return this.model.deleteOne(filter);
    }


    // =========================
    // DELETE MANY
    // =========================

    deleteMany({
        filter
    }: {
        filter: QueryFilter<T>
    }): Promise<DeleteResult> {
        return this.model.deleteMany(filter);
    }


    // =========================
    // FIND ONE AND UPDATE
    // =========================

    findOneAndUpdate({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: QueryOptions<T> & { lean: false }
    }): Promise<HydratedDocument<T> | null>;

    findOneAndUpdate({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: QueryOptions<T> & { lean: true }
    }): Promise<FlattenMaps<T> | null>;

    findOneAndUpdate({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
        const query = this.model.findOneAndUpdate(
            filter,
            update,
            options
        );

        return query.exec();
    }
}