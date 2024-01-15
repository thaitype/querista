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

// Expected result:

const db = {} as any;
const usersTable = {} as any;
const postTable = {} as any;

db.select({
  projectId: usersTable.projectId,
  count: sql`count(${usersTable.id})`,
})
  .from(sql`${usersTable}`)
  .where(sql`${usersTable.id} > 10`)
  .innerJoin(usersTable, sql`${usersTable.projectId} = ${usersTable.project.id}`)
  .innerJoin(postTable, sql`${postTable.userId} = ${usersTable.id}`)
  .groupBy(sql`${postTable.projectId}`);

// Expected result for subquery:

const nestedQuery = db
  .select({
    name: usersTable.projectId,
    age: usersTable.age,
  })
  .from(usersTable)
  .where(sql`${usersTable.id} > 10`);

db.select({
  projectId: usersTable.projectId,
  count: sql`count(${usersTable.id})`,
})
  .from(usersTable)
  .where(sql`${usersTable.id} > 10`)
  .innerJoin(nestedQuery, sql`${nestedQuery.name} = ${usersTable.name}`)
  .innerJoin(postTable, sql`${postTable.userId} = ${usersTable.id}`)
  .groupBy(sql`${postTable.projectId}`);

// expected output:
// const subqueryJoinExpected = `
//   SELECT
//     doggos.*
//     FROM
//     person
//     INNER JOIN (
//       SELECT
//         owner_id AS owner,
//         name
//       FROM
//         pet
//       WHERE
//         name = 'Doggo'
//     ) AS doggos

//   ON doggos.owner = person.id;`;

// Expected result for subquery example 2:
const petTable = {} as any;
const personTable = {} as any;

const nestedQueryEx2 = db
  .select({
    name: petTable.name,
    owner: petTable.owner_id,
  })
  .from(petTable)
  .where(sql`${petTable.name} = 'Doggo'`);

db.select()
  .from(personTable)
  .innerJoin(nestedQueryEx2, sql`${nestedQueryEx2.owner} = ${personTable.id}`);

// expected result for query example 2:
const column = {} as any;
db.select({
  name: petTable.name,
  owner: petTable.owner_id,
}).sql(
  ({ $columns }: any) => `
  SELECT
    ${$columns()},
  FROM ${personTable}
  WHERE ${personTable.id} = 1
  INNER JOIN ${petTable} ON ${petTable.owner_id} = ${personTable.id}
`
);
