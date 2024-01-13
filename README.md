# @thaitype/builder

> In development process & Proof of concept

This project introduces a simple yet powerful TypeScript implementation for building type-safe SQL queries. The primary goal is to enhance the developer experience when interacting with databases by providing a robust and type-checked way to construct SQL queries.

## Features
- **Type Safety**: Leverage the strong typing capabilities of TypeScript to ensure that your SQL queries are not only syntactically correct but also adhere to the defined data types.

- **Query Builder Pattern**: The implementation includes a query builder pattern, making it intuitive to construct complex SQL queries in a fluent and readable manner.

- **Table and Column Mapping**: Easily map database tables and columns to TypeScript types, ensuring a seamless transition between the database schema and your application code.

## Expected Usage

From [option 1](src/option1.ts): 

```ts
const result = new Query()
  .table('pr', "sys.database_principals").column<sys.DatabasePrincipals>()
  .table('pe', 'sys.database_permission').column<sys.DatabasePermissions>()
  .table('o', 'sys.objects').column<sys.Objects>()
  .table('s', 'sys.schema').column<sys.Schemas>()
  .sql<ShowUserPermission>(_ => `
    SELECT 
      ${_.pr.principal_id},
      ${_.pr.name},
      ${_.pr.type_desc},
      ${_.pr.authentication_type_desc} AS auth_type,
      ${_.pe.state_desc},
      ${_.pe.permission_name},
      ${_.s.name} + '.' + ${_.o.name} AS ObjectName,
      USER_NAME(${_.pe.grantee_principal_id}) AS grantee,
      USER_NAME(${_.pe.grantor_principal_id}) AS grantor,
      ${_.pr.create_date},
      ${_.pr.modify_date}
    FROM ${_.pr.$alias}
    INNER JOIN ${_.pe.$alias} ON ${_.pe.grantee_principal_id} = ${_.pr.principal_id}
    INNER JOIN ${_.o.$alias} ON ${_.pe.major_id} = ${_.o.object_id}
    INNER JOIN ${_.s.$alias} ON ${_.o.schema_id} = ${_.s.schema_id}
    WHERE ${_.pr.type_desc} = 'SQL_USER' AND ${_.pr.name} = 'MY_USER'
  `);
```

The result should be:

```sql
SELECT 
      pr.principal_id,
      pr.name,
      pr.type_desc,
      pr.authentication_type_desc AS auth_type,
      pe.state_desc,
      pe.permission_name,
      s.name + '.' + o.name AS ObjectName,
      USER_NAME(pe.grantee_principal_id) AS grantee,
      USER_NAME(pe.grantor_principal_id) AS grantor,
      pr.create_date,
      pr.modify_date,
  FROM sys.database_principals AS pr
  INNER JOIN sys.database_permissions AS pe ON pe.grantee_principal_id = pr.principal_id
  INNER JOIN sys.objects AS o ON pe.major_id = o.object_id
  INNER JOIN sys.schemas AS s ON o.schema_id = s.schema_id
  WHERE pr.type_desc = 'SQL_USER' AND pr.name = 'MY_USER'
```

## Contribution
Contributions are welcome! Feel free to submit issues, feature requests, or pull requests to help improve this project.