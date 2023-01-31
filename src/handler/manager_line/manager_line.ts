import { Client, Message, MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { keyword } from '../../consts/keyword'
import { createManager, getManagerByLineId, updateManager } from '../../lib/firestore/manager'
import { TextTemplate } from '../../lib/line/template'
import { Manager } from '../../types/managers'
import {
  askName,
  askNameAgain,
  confirmName,
  decideName,
  tellWelcome,
  tellWelcomeBack,
} from './setup'

export class managerLineHandler {
  constructor(private client: Client) {
    this.client = client
  }

  handle(req: Request, res: Response) {
    const events: WebhookEvent[] = req.body.events
    //events[0]のみ対応するかは、まだ検討中
    Promise.all(events.map((event) => handleEvent(this.client, event)))
      .then((result) => {
        if (result !== null) res.json(result)
      })
      .catch((err) => {
        console.log(err)
        //
        res.json(
          this.client.pushMessage(
            events[0].source.userId,
            TextTemplate('システムでエラーが発生しました。'),
          ),
        )
      })
  }
}

const handleEvent = async (client: Client, event: WebhookEvent) => {
  let message: Message = { type: 'text', text: 'メッセージがありません。' }

  const manager = await getManagerByLineId(event.source.userId)
  if (manager !== undefined) {
    await createManager(event.source.userId)
  }
  //const action = react(event, manager)
  //action(manager, message)
  if (event.type === 'unfollow') {
    manager.enable = false
    return Promise.resolve()
  } else if (event.type === 'follow') {
    if (manager.name === '' || manager.status === '名前入力') {
      return client.replyMessage(event.replyToken, [tellWelcome(event), askName()])
    } else {
      manager.enable = true
      return client.replyMessage(event.replyToken, [tellWelcomeBack(manager)])
    }
  } else if (event.type === 'message') {
    const messages = await react(event, manager)
    return client.replyMessage(event.replyToken, messages)
  }
}

const react = async (event: MessageEvent, manager: Manager): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (manager.status) {
      case '名前入力':
        switch (event.message.text) {
          case keyword.yes:
            manager.status = ''
            manager.enable = true
            updateManager(manager).then(() => {
              return [decideName(event, manager)]
            })
          case keyword.no:
            manager.name = ''
            updateManager(manager).then(() => {
              return [askNameAgain(event)]
            })
          default:
            manager.name = event.message.text
            updateManager(manager).then(() => {
              return [confirmName(event)]
            })
        }
      default:
        return [{ type: 'text', text: '未実装です。' } as TextMessage]
    }
  } else {
    switch (manager.status) {
      case '名前入力':
        return [askNameAgain(event)]
      default:
        return [{ type: 'text', text: '未実装です。' } as TextMessage]
    }
  }
}
