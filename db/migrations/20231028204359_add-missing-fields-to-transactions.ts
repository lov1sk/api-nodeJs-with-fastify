import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.uuid("sessionId").index(); // Criando um campo que recebe um valor uuid padrão e se chama id
    table.decimal("amount").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    // more table fields here
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("sessionId");
    table.dropColumn("amount");
    table.dropColumn("created_at");
    // more table fields here
  });
}
