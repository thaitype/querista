// Doc: https://orm.drizzle.team/docs/sql
// drizzle-orm/src/sql/sql.ts

// learn how to use this

/**
 * Anything that can be passed to the `` sql`...` `` tagged function.
 */

export type SQLChunk =
  | StringChunk
  | SQLChunk[]
  | SQLWrapper
  | SQL
  // | Table
  // | View
  // | Subquery
  // | AnyColumn
  // | Param
  // | Name
  | undefined;
// | FakePrimitiveParam
// | Placeholder;

/**
 * Any value that implements the `getSQL` method. The implementations include:
 * - `Table`
 * - `Column`
 * - `View`
 * - `Subquery`
 * - `SQL`
 * - `SQL.Aliased`
 * - `Placeholder`
 * - `Param`
 */
export interface SQLWrapper {
  getSQL(): SQL;
}

export class StringChunk implements SQLWrapper {
  // static readonly [entityKind]: string = 'StringChunk';

  readonly value: string[];

  constructor(value: string | string[]) {
    this.value = Array.isArray(value) ? value : [value];
  }

  getSQL(): SQL<unknown> {
    return new SQL([this]);
  }
}

export class SQL<T = unknown> implements SQLWrapper {
  constructor(readonly chunks: SQLChunk[]) {}

  getSQL(): SQL {
    return this;
  }
}

export function sql<T>(strings: TemplateStringsArray, ...params: any[]): SQL<T>;
export function sql(strings: TemplateStringsArray, ...params: SQLChunk[]): SQL {
  const queryChunks: SQLChunk[] = [];
  if (params.length > 0 || (strings.length > 0 && strings[0] !== '')) {
    queryChunks.push(new StringChunk(strings[0]!));
  }
  for (const [paramIndex, param] of params.entries()) {
    queryChunks.push(param, new StringChunk(strings[paramIndex + 1]!));
  }

  return new SQL(queryChunks);
}

const table = 'xxx';

console.log(JSON.stringify(sql`SELECT * FROM ${table}`, null, 2));

const result = {
  chunks: [
    {
      value: ['SELECT * FROM '],
    },
    'xxx',
    {
      value: [''],
    },
  ],
};
