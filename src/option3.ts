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

export interface ShowUserPermission{
  principal_id: number;
  name: string;
  type_desc: string;
  /**
   * authentication_type_desc
   */
  auth_type: string;
  state_desc: string;
  permission_name: string;
  ObjectName: string;
  /**
   * grantee principal_name
   */
  grantee: string;
  /**
   * grantor principal_name
   */
  grantor: string;
  create_date: Date;
  modify_date: Date;
}

namespace sys {

  export interface DatabasePrincipals {
    principal_id: number;
    name: string;
    type_desc: string;
    authentication_type_desc: string;
    default_schema_name: string;
    create_date: Date;
    modify_date: Date;
  }

  export interface DatabasePermissions {
    class_desc: string;
    major_id: number;
    minor_id: number;
    grantee_principal_id: number;
    grantor_principal_id: number;
    type: string;
    permission_name: string;
    state_desc: string;
  }

  export interface Objects {
    object_id: number;
    name: string;
    schema_id: number;
    parent_object_id: number;
    type: string;
    type_desc: string;
    create_date: Date;
    modify_date: Date;
  }

  export interface Schemas {
    schema_id: number;
    name: string;
    principal_id: number;
    schema_owner: string;
    create_date: Date;
    modify_date: Date;
  }

}

const username = "testuser";
type AnyColumnSchema = object;


class Query<T extends object, TM extends Record<string, unknown> = {}, Output = ExcludeProperties<T, unknown[]>> {

    tableMap: TM = {} as TM;
    
    sql(
      projector: (proxy: TM & { $output: Output, $columns: () => string }) => string
    ) {
      return {} as Output[];
    }  

    public select<U extends ProjectorType>(projector: (proxy: TM) => U ) {
      return this as unknown as Query<T, TM, U>;
    }

    table<Table extends Record<string, unknown>>(table: Table) {
      return new TableColumn<T, Table , TM>(this as any);
    }
}

class TableColumn<T extends object, Table extends Record<string, unknown>, TM extends Record<string, unknown>> {

  constructor(private query: Query<T>) {}

  column<U extends AnyColumnSchema = Record<string, unknown>>() {
    return this.query as unknown as Query<T, TM & Record<keyof Table, U & { $alias: () => string }>>;
  }
}

// Internal Type Schema
type A = {
  pr: sys.DatabasePrincipals,
  pe: sys.DatabasePermissions,
  o: sys.Objects,
}

// With simple column output
const result = new Query<ShowUserPermission>()
  .table({ pr: "sys.database_principals" }).column<sys.DatabasePrincipals>()
  .table({ pe: "sys.database_permissions" }).column<sys.DatabasePermissions>()
  .table({ o: "sys.objects" }).column<sys.Objects>()
  .table({ s: "sys.schemas" }).column<sys.Schemas>()
  .select(_ => ({
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
    FROM ${_.pr.$alias()}
    INNER JOIN ${_.pe.$alias()} ON ${_.pe.grantee_principal_id} = ${_.pr.principal_id}
    INNER JOIN ${_.o.$alias()} ON ${_.pe.major_id} = ${_.o.object_id}
    INNER JOIN ${_.s.$alias()} ON ${_.o.schema_id} = ${_.s.schema_id}
    WHERE ${_.pr.type_desc} = 'SQL_USER' AND ${_.pr.name} = '${username}'
  `);







  
type Result = typeof result;
// type Result = {
//   principal_id: number;
//   name: string;
//   type_desc: string;
//   auth_type: string;
//   state_desc: string;
//   permission_name: string;
//   ObjectName: string;
//   grantee: string;
//   grantor: string;
//   create_date: Date;
//   modify_date: Date;
// }[];

// Output:

const sql = `SELECT pr.principal_id
        ,pr.name
        ,pr.type_desc
        ,pr.authentication_type_desc AS auth_type
        ,pe.state_desc
        ,pe.permission_name
        ,s.name + '.' + o.name AS ObjectName
        ,USER_NAME(pe.grantee_principal_id) AS grantee
        ,USER_NAME(pe.grantor_principal_id) AS grantor
        ,pr.create_date
        ,pr.modify_date
    FROM sys.database_principals AS pr
    INNER JOIN sys.database_permissions AS pe ON pe.grantee_principal_id = pr.principal_id
    INNER JOIN sys.objects AS o ON pe.major_id = o.object_id
    INNER JOIN sys.schemas AS s ON o.schema_id = s.schema_id
    WHERE pr.type_desc = 'SQL_USER' AND pr.name = '${username}'`;