import { ShowUserPermission, sys } from './interface';
/**
 * Proof of concept
 */

// https://kysely.dev/docs/getting-started?dialect=mssql
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



const username = "testuser";
type AnyColumnSchema = object;



type InferRecordOutputQuery<T extends Record<string, Query<any, any, any>>> =  
  T extends Record<string, Query<any, any, infer U>> ? U : never;

/**
 * Note
 * 
 * $columns() returns the columns with table alias
 * for example:
 *  $columns() => "pr.principal_id, pr.name, pr.type_desc, pr.authentication_type_desc AS auth_type, pr.default_schema_name, pr.create_date, pr.modify_date"
 */

class Query<T extends object, TM extends Record<string, unknown> = {}, Output = ExcludeProperties<T, unknown[]>> {

    tableMap: TM = {} as TM;
    
    sql(
      projector: (proxy: TM & { $output: Output, $columns: () => string }) => string
    ) {
      return {} as Query<T, TM, Output>;
    }  

    public column<U extends ProjectorType>(projector: (proxy: TM) => U ) {
      return this as unknown as Query<T, TM, U>;
    }

    table<TableKey extends string>(table: TableKey): TableColumn<T, TableKey , TM, any>;

    table<Table extends Record<string, string>>(table: Table): TableColumn<T, keyof Table , TM, any >;

    /**
     * Accept Subquery
     */
    table<TableSubQuery extends Record<string, Query<any>>>(table: TableSubQuery): 
      TableColumn<T, keyof TableSubQuery , TM, InferRecordOutputQuery<TableSubQuery>>;

    table<Table extends Record<string, string>, TableSubQuery extends Record<string, Query<any>>>(nameOrTable: string | Table) {
      return new TableColumn<T, keyof Table , TM, any>(this as any);
    }
}

/**
 * Note:
 * 
 * $table() returns the table name or table with alias
 * for example:
 *  $table() => "sys.database_principals" | "sys.database_principals AS pr"
 * 
 */

class TableColumn<T extends object, TableKey extends keyof any, TM extends Record<string, unknown>, ExpectedColumn> {

  constructor(private query: Query<T>) {}

  column<U extends ExpectedColumn>() {
    return this.query as unknown as Query<T, TM & Record<TableKey, U  & { $table: () => string }> >;
  }
}

// Internal Type Schema
type A = {
  pr: sys.DatabasePrincipals,
  pe: sys.DatabasePermissions,
  o: sys.Objects,
}
function demo(){// Alias table names
 const result = new Query<ShowUserPermission>()
  .table({ pr: "sys.database_principals" }).column<sys.DatabasePrincipals>()
  .table({ pe: "sys.database_permissions" }).column<sys.DatabasePermissions>()
  .table({ o: "sys.objects" }).column<sys.Objects>()
  .table({ s: "sys.schemas" }).column<sys.Schemas>()
  .column(_ => ({
      principal_id: _.pr.principal_id,
      name: _.pr.name,
      type_desc: _.pr.type_desc,
      auth_type: _.pr.authentication_type_desc,
      state_desc: _.pe.state_desc,
      permission_name: _.pe.permission_name,
      ObjectName: `${_.s.name} + '.' + ${_.o.name}`,
      grantee: `USER_NAME(${_.pe.grantee_principal_id})`,
      grantor: `USER_NAME(${_.pe.grantor_principal_id})`,
      create_date: _.pr.create_date,
      modify_date: _.pr.modify_date
  }))
  .sql(_ => `
    SELECT 
      ${_.$columns()}
    FROM ${_.pr.$table()}
    INNER JOIN ${_.pe.$table()} ON ${_.pe.grantee_principal_id} = ${_.pr.principal_id}
    INNER JOIN ${_.o.$table()} ON ${_.pe.major_id} = ${_.o.object_id}
    INNER JOIN ${_.s.$table()} ON ${_.o.schema_id} = ${_.s.schema_id}
    WHERE ${_.pr.type_desc} = 'SQL_USER' AND ${_.pr.name} = '${username}'
  `);

}

// Test with Subquery Join
// Code from https://kysely.dev/docs/examples/JOIN/subquery-join


// doggos: {
//   doggos: {
//       owner: string;
//       name: string;
//   };
// } & {
//   $table: () => string;
// }

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

const innerJoinQuery = new Query()
      .table("pet").column<{ owner_id: string, name: string }>()
      .column(_ => ({
        owner: _.pet.owner_id,
        name: _.pet.name,
      }))
      .sql(_ => `
        SELECT
          ${_.$columns()}
        FROM ${_.pet.$table()}
        WHERE ${_.pet.name} = 'Doggo'
      `);

const resultSubqueryJoin = new Query()
      .table("person").column<{ id: string }>()
      .table({ "doggos": innerJoinQuery }).column()
      .column(_ => ({
        owner: _.person.id,
        name: _.doggos.name,
      }))
      .sql(_ => `
        SELECT
          ${_.$columns()}
        FROM ${_.person.$table()}
        INNER JOIN ${_.doggos.$table()} ON ${_.doggos.owner} = ${_.person.id}
      `);
