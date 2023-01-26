import { Client, Message, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { getManagerByLineId } from '../../lib/firestore/manager'
import { Manager } from '../../types/managers'
import { newManager, returningManager } from './setup'

export class managerLineHandler {
  constructor(private client: Client) {
    this.client = client
  }

  handle(req: Request, res: Response) {
    const events: WebhookEvent[] = req.body.events
    Promise.all(events.map((event) => handleEvent(this.client, event))).then((result) =>
      res.json(result),
    )
  }
}

const handleEvent = async (client: Client, event: WebhookEvent) => {
  let message: Message = { type: 'text', text: 'メッセージがありません。' }

  const manager = await getManagerByLineId(event.source.userId)
  //const action = react(event, manager)
  //action(manager, message)
  switch (event.type) {
    case 'unfollow':
      return Promise.resolve()
    case 'follow':
      break
    case 'message':
      break
    default:
      return Promise.resolve()
  }
  const action = react(event, manager)
  message = action(manager)

  return client.replyMessage(event.replyToken, message)
}

const react = (event: WebhookEvent, manager: Manager): ((manager: Manager) => Message) => {
  if (event.type === 'follow') {
    if (manager.name === '') return newManager
    else returningManager
  }
}
