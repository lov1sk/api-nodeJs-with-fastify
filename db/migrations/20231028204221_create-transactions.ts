import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary(); // Criando um campo que recebe um valor uuid padrão e se chama id
    // more table fields here
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("transactions");
}
