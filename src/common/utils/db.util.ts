import { camelCase } from 'lodash';
import {
  Aggregate,
  FilterQuery,
  Model,
  PipelineStage,
  PopulateOptions,
} from 'mongoose';

interface IPaginateAggregate {
  page: number;
  limit: number;
}

interface IJoinAggregate {
  from: string;
  foreignField: string;
  as?: string;
  pipeline?: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[];
}

interface IFilter<T> {
  filter?: FilterQuery<T>;
  sort?: FilterQuery<T>;
  populate?: PopulateOptions[];
  select?:
    | string
    | string[]
    | Record<string, number | boolean | string | object>;
}

export const JoinAggregate = (
  payload: IJoinAggregate,
): PipelineStage.Lookup => {
  const query = {
    from: camelCase(payload.from),
    localField: '_id',
    foreignField: payload.foreignField,
    as: camelCase(payload.as) || payload.foreignField,
  };

  if (payload.pipeline) query['pipeline'] = payload.pipeline;

  return {
    $lookup: query,
  };
};

export const PopulateAggregate = (
  payload: IJoinAggregate | IJoinAggregate[],
) => {
  const aggregate = new Aggregate();

  if (!Array.isArray(payload)) {
    const name = camelCase(payload.from);
    const query = {
      from: name,
      localField: payload.foreignField,
      foreignField: '_id',
      as: camelCase(payload.as) || payload.foreignField,
    };
    if (payload.pipeline) query['pipeline'] = payload.pipeline;
    aggregate.lookup(query);
    aggregate.unwind(`$${payload.foreignField}`);

    return aggregate['_pipeline'] as any[];
  }

  payload.forEach((schema) => {
    const nameCamelCase = camelCase(schema.from);
    const query = {
      from: nameCamelCase,
      localField: schema.foreignField,
      foreignField: '_id',
      as: camelCase(schema.as) || schema.foreignField,
    };
    if (schema.pipeline) query['pipeline'] = schema.pipeline;
    aggregate.lookup(query);
    aggregate.unwind(`$${schema.foreignField}`);
  });

  return aggregate['_pipeline'] as any[];
};

export const OrAggregate = <T>(match: Array<FilterQuery<T>>) => {
  const aggregate = new Aggregate<T>();
  aggregate.match({
    $or: match,
  });

  return aggregate['_pipeline'] as any[];
};

export const FilterAggregate = <T>(match: FilterQuery<T>) => {
  const aggregate = new Aggregate<T>();
  aggregate.match(match);

  return aggregate['_pipeline'] as PipelineStage.Match[];
};

export const FilterAndAggregate = <T>(match: FilterQuery<T>[]) => {
  const aggregate = new Aggregate<T>();
  aggregate.match({
    $and: match,
  });

  return aggregate['_pipeline'] as PipelineStage.Match[];
};

export const PaginateAggregate = async <T>(
  model: Model<T>,
  payload: IPaginateAggregate,
  pipeline?: PipelineStage[],
) => {
  const { limit, page } = payload;

  const isPipeline: PipelineStage[] = pipeline || [];
  const countFilter: PipelineStage[] = [...pipeline] || [];

  if (page) isPipeline.push({ $skip: limit * (page - 1) });
  if (limit) isPipeline.push({ $limit: limit });

  const [aggregate, totalDocs] = await Promise.all([
    model.aggregate(isPipeline),
    countFilter.length > 0
      ? model.aggregate(countFilter).then((data) => data.length)
      : model.countDocuments(),
  ]);

  return {
    page,
    limit,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit),
    docs: aggregate,
  };
};

export const PaginateCustom = async <T>(
  model: Model<T>,
  payload: IPaginateAggregate,
  filter?: IFilter<T>,
) => {
  const { limit, page } = payload;

  const pipeline = model.find(filter?.filter).populate(filter.populate);
  if (filter.sort) pipeline.sort(filter.sort);
  if (limit) pipeline.limit(limit);
  if (limit && page) pipeline.skip(limit * (page - 1));
  if (filter.select) pipeline.select(filter.select);

  const [result, totalDocs] = await Promise.all([
    pipeline.exec(),
    model.countDocuments(filter.filter),
  ]);

  return {
    page,
    limit,
    totalDocs: totalDocs,
    totalPages: Math.ceil(totalDocs / limit),
    docs: result,
  };
};

export const SearchDB = (search: string) => {
  const regex = new RegExp(search);
  return { $regex: regex, $options: 'i' };
};
