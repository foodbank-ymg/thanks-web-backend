import { Client, middleware } from '@line/bot-sdk'
import express from 'express'
import { loadConfig } from '../config/config'
import { managerLineHandler } from './manager_line/manager_line'
import { recipientLineHandler } from './recipient_line/recipient_line'
export const app = express()

const config = loadConfig()

const managerMiddleware = middleware({
  channelSecret: config.managerLineSecret,
})
const managerClient = new Client({
  channelAccessToken: config.managerLineAccessToken,
  channelSecret: config.managerLineSecret,
})
app.post('/manager-line', managerMiddleware, new managerLineHandler(managerClient).handle)

const recipientMiddleware = middleware({
  channelSecret: config.recipientLineSecret,
})
const recipientClient = new Client({
  channelAccessToken: config.recipientLineAccessToken,
  channelSecret: config.recipientLineSecret,
})
app.post('/recipient-line', recipientMiddleware, new recipientLineHandler(recipientClient).handle)

// TODO: 仕様が固まり次第着手します
// app.post('/batch', middleware, (req, res) => lineEvent(client, req, res));

app.get('/batch/ping', (req, res) => {
  res.send('pong2')
})
