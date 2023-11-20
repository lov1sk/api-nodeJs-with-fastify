import { fastify } from "fastify";
import { TransactionsRoutes } from "./routes/transactions";
import cookie from "@fastify/cookie";

export const app = fastify();
app.register(cookie);
app.register(TransactionsRoutes, {
  prefix: "/transactions",
});
app.get("/", async (req, res) => {
  return "Bem vindo, link do GitHub para documentação: https://github.com/lov1sk/api-nodeJs-with-fastify";
});
