import { ExcludeProperties, InferRecordOutputQuery, ProjectorType } from './types';
/**
 * Proof of concept
 */


/**
 * Note
 * 
 * $columns() returns the columns with table alias
 * for example:
 *  $columns() => "pr.principal_id, pr.name, pr.type_desc, pr.authentication_type_desc AS auth_type, pr.default_schema_name, pr.create_date, pr.modify_date"
 */

export class TableSchema<T extends object, TM extends Record<string, unknown> = {}, Output = ExcludeProperties<T, unknown[]>> {

    protected tableMap: TM = {} as TM;
    
    sql(
      projector: (proxy: TM & { $output: Output, $columns: () => string }) => string
    ) {
      return {} as TableSchema<T, TM, Output>;
    } 
    
    build(){
      return '';
    }

    query(){
      return [] as Output[];
    }

    public column<U extends ProjectorType>(projector: (proxy: TM) => U ) {
      return this as unknown as TableSchema<T, TM, U>;
    }

    table<TableKey extends string>(table: TableKey): TableColumn<T, TableKey , TM, any>;

    table<Table extends Record<string, string>>(table: Table): TableColumn<T, keyof Table , TM, any >;

    /**
     * Accept Subquery
     */
    table<TableSubQuery extends Record<string, TableSchema<any>>>(table: TableSubQuery): 
      TableColumn<T, keyof TableSubQuery , TM, InferRecordOutputQuery<TableSubQuery>>;

    table<Table extends Record<string, string>, TableSubQuery extends Record<string, TableSchema<any>>>(nameOrTable: string | Table) {
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

export class TableColumn<T extends object, TableKey extends keyof any, TM extends Record<string, unknown>, ExpectedColumn> {

  constructor(private query: TableSchema<T>) {}

  schema<U extends ExpectedColumn>() {
    return this.query as unknown as TableSchema<T, TM & Record<TableKey, U  & { $table: () => string }> >;
  }
}
