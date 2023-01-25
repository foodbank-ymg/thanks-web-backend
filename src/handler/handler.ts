import { Client, middleware, MiddlewareConfig } from "@line/bot-sdk";
import express, { Express } from "express";
import { loadConfig } from "../config/config";
import { adminLineHandler } from "./admin_line/admin_line";
import { batchHandler } from "./batch/batch";
import { userLineHandler } from "./user_line/user_line";
export const app = express();

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

const config = loadConfig();
const adminClient = new Client(config.closedLine);
const adminMiddleware = middleware(config.closedLine as MiddlewareConfig);
const userClient = new Client(config.publicLine);
const userMiddleware = middleware(config.publicLine as MiddlewareConfig);

adminLineHandler(app, adminMiddleware, adminClient);
userLineHandler(app);
batchHandler(app);

app.get("/batch/ping", (req, res) => {
  res.send("pong");
});
