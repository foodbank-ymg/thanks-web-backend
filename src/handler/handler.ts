import { Client, middleware } from '@line/bot-sdk'
import express from 'express'
import { loadConfig } from '../config/config'
import { managerLineHandler } from './manager_handler/manager_handler'
import { recipientLineHandler } from './recipient_handler/recipient_handler'
import { newFirestore } from '../lib/firestore/firestore'
import { newStorage } from '../lib/storage/storage'
import admin from 'firebase-admin'

export const app = express()

const config = loadConfig()

const managerMiddleware = middleware({
  channelSecret: config.managerLineSecret,
})
const managerClient = new Client({
  channelAccessToken: config.managerLineAccessToken,
  channelSecret: config.managerLineSecret,
})

const recipientMiddleware = middleware({
  channelSecret: config.recipientLineSecret,
})
const recipientClient = new Client({
  channelAccessToken: config.recipientLineAccessToken,
  channelSecret: config.recipientLineSecret,
})
admin.initializeApp()
newFirestore()
newStorage()

app.post('/manager-line', managerMiddleware, (req, res) =>
  new managerLineHandler(managerClient, recipientClient).handle(req, res),
) //* without [(req, res) =>] it was not working. temporary fix.

app.post('/recipient-line', recipientMiddleware, (req, res) =>
  new recipientLineHandler(managerClient, recipientClient).handle(req, res),
)

// TODO: 仕様が固まり次第着手します
// app.post('/batch', middleware, (req, res) => lineEvent(client, req, res));

app.get('/batch/ping', (req, res) => {
  res.send('pong2')
})
