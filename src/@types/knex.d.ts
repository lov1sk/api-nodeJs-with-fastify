import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    // definir aqui o tipo de tabela como um objeto
    transactions: {
      id: string;
      title: string;
      amount: number;
      created_at: string;
      sessionId?: string;
    };
  }
}
