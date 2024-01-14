
// Test with Subquery Join
// Code from https://kysely.dev/docs/examples/JOIN/subquery-join

import { TableSchema } from "src/query";


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

const innerJoinQuery = new TableSchema()
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

const resultSubqueryJoin = new TableSchema()
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
