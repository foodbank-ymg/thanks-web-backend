import { Client, Message, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { keyword } from '../../consts/keyword'
import { getManagerByLineId, updateManager } from '../../lib/firestore/manager'
import { Manager } from '../../types/managers'
import { askNameAgain, confirmName, decideName, newManager, returningManager } from './setup'

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
  if (event.type === 'unfollow') {
    manager.enable = false
    return Promise.resolve()
  }

  const action = react(event, manager)
  message = action(event, manager)
  updateManager(manager)

  if (!(event.type === 'follow' || event.type === 'message')) return Promise.resolve()
  return client.replyMessage(event.replyToken, message)
}

const react = (
  event: WebhookEvent,
  manager: Manager,
): ((event: WebhookEvent, manager: Manager) => Message) => {
  if (event.type === 'follow') {
    if (manager.name === '' || manager.status === '名前入力') return newManager
    else return returningManager
  } else if (event.type === 'message') {
    if (event.message.type === 'text') {
      switch (manager.status) {
        case '名前入力':
          switch (event.message.text) {
            case keyword.yes:
              return decideName
            case keyword.no:
              return askNameAgain
          }
          return confirmName
        default:
          return (event, manager) => {
            return { type: 'text', text: '未実装です。' } as TextMessage
          }
      }
    }
  }
}
