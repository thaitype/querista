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
  
  export namespace sys {
  
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