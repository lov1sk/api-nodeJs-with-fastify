import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.text("title").after("sessionId").notNullable();
    // more table fields here
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("title");
  });
}
