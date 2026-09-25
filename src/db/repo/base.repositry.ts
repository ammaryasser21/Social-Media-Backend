import { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery, UpdateResult } from 'mongoose';
export abstract class BaseRepositry<T> {

    constructor(private model: Model<T>) { }

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
        const docs = this.model.findOne(filter, projection);
        if (options?.lean) {
            docs.lean();
        }
        if (options?.populate) {
            docs.populate(options.populate as PopulateOptions);
        }

        return docs;
    }

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
        const docs = this.model.findById(id, projection);
        if (options?.lean) {
            docs.lean() as FlattenMaps<T>;
        }
        if (options?.populate) {
            docs.populate(options.populate as PopulateOptions);
        }

        return docs;
    }

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

    deleteOne({
        filter
    }: {
        filter: QueryFilter<T>

    }): Promise<DeleteResult> {
        return this.model.deleteOne(filter);
    }

    deleteMany({
        filter
    }: {
        filter: QueryFilter<T>

    }): Promise<DeleteResult> {
        return this.model.deleteMany(filter);
    }



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
        const docs = this.model.findOneAndUpdate(filter, update, options)
        if (options?.lean) {
            docs.lean();
        }

        return docs;
    }


}