import { TableSchema } from "src/main";
import { ShowUserPermission, sys } from "./interfaces";

const username = "testuser";

const schema = new TableSchema()
    .table({ pr: "sys.database_principals" }).schema<sys.DatabasePrincipals>()
    .table({ pe: "sys.database_permissions" }).schema<sys.DatabasePermissions>()
    .table({ o: "sys.objects" }).schema<sys.Objects>()
    .table({ s: "sys.schemas" }).schema<sys.Schemas>()
    
const result = schema
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
        aaa: _.pr.create_date
    }))
    .sql(_ => `
    SELECT 
        ${_.$columns()}
    FROM ${_.pr.$table()}
    INNER JOIN ${_.pe.$table()} ON ${_.pe.grantee_principal_id} = ${_.pr.principal_id}
    INNER JOIN ${_.o.$table()} ON ${_.pe.major_id} = ${_.o.object_id}
    INNER JOIN ${_.s.$table()} ON ${_.o.schema_id} = ${_.s.schema_id}
    WHERE ${_.pr.type_desc} = 'SQL_USER' AND ${_.pr.name} = '${username}'
    `)
    .query()
