/**
 * Proof of concept
 */

import { ShowUserPermission, sys } from "../interfaces/interface";

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

// Alias table names
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

// Table without alias
const result2 = new Query<ShowUserPermission>()
  .table("sys.database_principals").column<sys.DatabasePrincipals>()
  .table("sys.database_permissions").column<sys.DatabasePermissions>()
  .table("sys.objects").column<sys.Objects>()
  .table("sys.schemas").column<sys.Schemas>()
  .column(_ => ({
      principal_id: _["sys.database_principals"].principal_id,
      name: _["sys.database_principals"].name,
      type_desc: _["sys.database_principals"].type_desc,
      auth_type: _["sys.database_principals"].authentication_type_desc,
      state_desc: _["sys.database_permissions"].state_desc,
      permission_name: _["sys.database_permissions"].permission_name,
      ObjectName: `${_["sys.schemas"].name} + '.' + ${_["sys.objects"].name}`,
      grantee: `USER_NAME(${_["sys.database_permissions"].grantee_principal_id})`,
      grantor: `USER_NAME(${_["sys.database_permissions"].grantor_principal_id})`,
      create_date: _["sys.database_principals"].create_date,
      modify_date: _["sys.database_principals"].modify_date,
  }))
  .sql(_ => `
    SELECT 
      ${_.$columns()}
    FROM ${_["sys.database_principals"].$table()}
    INNER JOIN ${_["sys.database_permissions"].$table()} ON ${_["sys.database_permissions"].grantee_principal_id} = ${_["sys.database_principals"].principal_id}
    INNER JOIN ${_["sys.objects"].$table()} ON ${_["sys.database_permissions"].major_id} = ${_["sys.objects"].object_id}
    INNER JOIN ${_["sys.schemas"].$table()} ON ${_["sys.objects"].schema_id} = ${_["sys.schemas"].schema_id}
    WHERE ${_["sys.database_principals"].type_desc} = 'SQL_USER' AND ${_["sys.database_principals"].name} = '${username}'
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

