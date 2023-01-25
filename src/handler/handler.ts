import { Client, middleware } from '@line/bot-sdk';
import express from 'express';
import { loadConfig } from '../config/config';
import { adminLineHandler } from './admin_line/admin_line';
import { userLineHandler } from './user_line/user_line';
export const app = express();

const config = loadConfig();

const adminMiddleware = middleware({ channelSecret: config.adminLineSecret });
const adminClient = new Client({
  channelAccessToken: config.adminLineAccessToken,
  channelSecret: config.adminLineSecret,
});
app.post(
  '/admin-line',
  adminMiddleware,
  new adminLineHandler(adminClient).handle,
);

const userMiddleware = middleware({ channelSecret: config.userLineSecret });
const userClient = new Client({
  channelAccessToken: config.userLineAccessToken,
  channelSecret: config.userLineSecret,
});
app.post('/user-line', userMiddleware, new userLineHandler(userClient).handle);

// TODO: 仕様が固まり次第着手します
// app.post('/batch', middleware, (req, res) => lineEvent(client, req, res));

app.get('/batch/ping', (req, res) => {
  res.send('pong');
});
