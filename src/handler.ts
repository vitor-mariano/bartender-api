import { DynamoDB } from "aws-sdk";
import express from "express";
import serverless from "serverless-http";

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

app.use((_req, res) => res.status(404).end());

export const handler = serverless(app);
