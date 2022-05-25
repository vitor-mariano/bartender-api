import { DynamoDB } from "aws-sdk";
import express from "express";
import { goCatch } from "go-catch";
import serverless from "serverless-http";
import * as Yup from "yup";
import { authenticated } from "./middlewares";

const app = express();
const db = new DynamoDB.DocumentClient();

app.use(express.json());

app.get("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const { Item: order } = await db
      .get({
        TableName: process.env.ORDERS_TABLE!,
        Key: { orderId },
      })
      .promise();

    if (!order)
      return res.status(404).json({ error: `Order ${orderId} not found` });

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error getting order ${orderId}` });
  }
});

app.post(
  "/orders/:orderId",
  async (req, res) => {
    const { orderId } = req.params;

    const [body, validationError] = await goCatch(
      Yup.object({
        items: Yup.array(
          Yup.object({
            description: Yup.string().required(),
            price: Yup.number().required(),
            quantity: Yup.number().integer().required(),
            delivered: Yup.boolean().required(),
          })
        ).required(),
      }).validate(req.body)
    );

    if (validationError) {
      return res.status(422).json({ error: validationError.message });
    }

    const payload = {
      orderId,
      items: body!.items,
    };

    try {
      await db
        .put({
          TableName: process.env.ORDERS_TABLE!,
          Item: payload,
        })
        .promise();

      res.json({ order: payload });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `Error creating order ${orderId}` });
    }
  },
  authenticated
);

app.use((_req, res) => res.status(404).end());

export const handler = serverless(app);
