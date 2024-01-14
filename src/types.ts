
// https://kysely.dev/docs/getting-started?dialect=mssql

import { Query } from "./main";

// https://github.com/cbrianball/ts-odata-client
export type ProjectorType = {
    [K: string]: boolean | number | string | Date | Array<unknown> | ProjectorType;
  };

/**
 * From T Exclude set of properties that extend TK.
 * Example: Exclude<{name: string, age: number}, number> will result in the type {name: string}
 * */
export type ExcludeProperties<T, TK> = Pick<
T,
{
  [K in keyof T]: T[K] extends TK ? never : K;
}[keyof T]
>;


export type AnyColumnSchema = object;

export type InferRecordOutputQuery<T extends Record<string, Query<any, any, any>>> =  
  T extends Record<string, Query<any, any, infer U>> ? U : never;

