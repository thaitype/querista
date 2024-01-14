# @thaitype/ts-builder

[![Test & Build](https://github.com/thaitype/sql-builder/actions/workflows/main.yml/badge.svg)](https://github.com/thaitype/sql-builder/actions/workflows/main.yml)

> In development process & Proof of concept

This project introduces a simple yet powerful TypeScript implementation for building type-safe SQL queries. The primary goal is to enhance the developer experience when interacting with databases by providing a robust and type-checked way to construct SQL queries.

## Features
- **Type Safety**: Leverage the strong typing capabilities of TypeScript to ensure that your SQL queries are not only syntactically correct but also adhere to the defined data types.

- **Query Builder Pattern**: The implementation includes a query builder pattern, making it intuitive to construct complex SQL queries in a fluent and readable manner.

- **Table and Column Mapping**: Easily map database tables and columns to TypeScript types, ensuring a seamless transition between the database schema and your application code.

## Expected Usage

### Expected Result: 

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

### Code

From [option 4](src/option1.4s): 

```ts
 const result = new Query<ShowUserPermission>()
  .table({ pr: "sys.database_principals" }).schema<sys.DatabasePrincipals>()
  .table({ pe: "sys.database_permissions" }).schema<sys.DatabasePermissions>()
  .table({ o: "sys.objects" }).schema<sys.Objects>()
  .table({ s: "sys.schemas" }).schema<sys.Schemas>()
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

```

## Subquery

Expected Value:

```sql
  SELECT
    doggos.*
    FROM
    person
    INNER JOIN (
      SELECT
        owner_id AS owner,
        name
      FROM
        pet
      WHERE
        name = 'Doggo'
    ) AS doggos 
```

TS Query:

```ts
const innerJoinQuery = new Query()
      .table("pet").schema<{ owner_id: string, name: string }>()
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
      .table("person").schema<{ id: string }>()
      .table({ "doggos": innerJoinQuery }).schema()
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
```

## Contribution
Contributions are welcome! Feel free to submit issues, feature requests, or pull requests to help improve this project.