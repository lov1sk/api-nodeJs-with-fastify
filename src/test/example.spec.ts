import request from "supertest";
import { app } from "../app";
import { execSync } from "node:child_process";
import { expect, beforeAll, afterAll, it, beforeEach, describe } from "vitest";

describe("transactions test", () => {
  beforeAll(async () => {
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    // Executa esses scripts antes de cada teste
    execSync("npm run knex migrate:rollback -- --all");
    execSync("npm run knex migrate:latest");
  });

  /**
   * Esse teste é criado uma transação e esperado que essa criação retorne
   * um statuscode 201
   */
  it("should be able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  /**
   * Esse teste é criado uma transação e esperado que essa criação retorne
   * um statuscode 201, alem disso é realizado uma listagem de todas as transações
   * e esperado que a transação criada esteja dentro da resposta
   */
  it("should be able to list all transactions", async () => {
    // Primeiro tenho que criar uma transação e esperar statuscode 201
    // tambem tenho que capturar o cookie que foi gerado 'sessionId'
    const createdTransaction = await request(app.server)
      .post("/transactions")
      .send({
        title: "Ultimo teste",
        amount: 99999,
        type: "credit",
      })
      .expect(201);

    // Captura do cookie
    const cookies = createdTransaction.get("Set-Cookie");

    // Listar todas as transações criada e esperar statuscode 200
    // Temos que enviar o respectivo cookie de sessionId
    const listAllTransactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    /* Esperar que o retorno da listagem seja um array que contenha um
     * objeto que contenha as informações que foram passadas a ele
     */
    expect(listAllTransactions.body.transactions).toEqual([
      expect.objectContaining({
        title: "Ultimo teste",
        amount: 99999,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createdTransactionResponse.get("Set-Cookie");

    const listTransactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);
    console.log(cookies);

    const transactionCreatedId = listTransactions.body.transactions[0].id;

    const {
      body: { transaction },
    } = await request(app.server)
      .get(`/transactions/${transactionCreatedId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(transaction).toEqual(
      expect.objectContaining({
        id: transactionCreatedId,
        title: "New Transaction",
        amount: 5000,
      })
    );
  });
  it("should be able to get a transactions summary", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createdTransactionResponse.get("Set-Cookie");
    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const summary = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);
    expect(summary.body.transactionsSummary).toEqual({
      totalAmount: 10000,
    });
  });
});
