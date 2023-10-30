import { z } from "zod";
import { knex } from "../lib/database";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-sessionId-exists";

export async function TransactionsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;
    const transactions = await knex("transactions").where(
      "sessionId",
      sessionId
    );
    return { transactions };
  });
  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionRequestSchema = z.object({
      id: z.string().uuid(),
    });
    const { sessionId } = request.cookies;
    const { id } = getTransactionRequestSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where({ sessionId, id })
      .first();

    return { transaction };
  });
  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies;
      const transactionsSummary = await knex("transactions")
        .where({ sessionId })
        .sum("amount", { as: "totalAmount" })
        .first();
      return { transactionsSummary };
    }
  );
  app.post("/", async (request, reply) => {
    // schema do zod
    const transactionRequestSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });
    // parsear todas as informações do request com o schema do zod
    const { title, amount, type } = transactionRequestSchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 Day
      });
    }

    // usar o knex com o insert no banco de dados
    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      sessionId,
    });

    // retornar o status 201
    return reply.status(201).send();
  });
}
