import { Client, Message, MessageEvent, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { managerStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { createManager, getManagerByLineId, updateManager } from '../../lib/firestore/manager'
import { TextTemplate } from '../../lib/line/template'
import { Manager } from '../../types/managers'
import {
  askName,
  askNameAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
} from './setup'

export class managerLineHandler {
  constructor(private client: Client) {
    this.client = client
  }

  async handle(req: Request, res: Response) {
    const events: WebhookEvent[] = req.body.events
    //events[0]のみ対応するかは、まだ検討中

    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        // handleEventが必要なDB処理などを実行しユーザー返答Message配列のPromiseを返してくる。
        // this.clientは渡さなくてよくなる
        const messages = await handleEvent(event).catch((err) => {
          if (err instanceof Error) {
            console.error(err)
            // LINEでエラーの旨を伝えたいので一旦コメントアウト
            // return res.status(500).json({
            // status: 'error',
            //});
            // 異常時は定型メッセージで応答
            return [TextTemplate(phrase.systemError)]
          }
        })

        // 正常時にそのメッセージを返し、結果をmapに集約する

        //eventの種類によってはreplyを行わない。
        if (event.type === 'message' || event.type === 'follow') {
          if (messages) return this.client.replyMessage(event.replyToken, messages)
        } else {
          return Promise.resolve()
        }
      }),
    )

    // すべてが終わり、resultsをBodyとしてhttpの200を返してる
    return res.status(200).json({
      status: 'success',
      results,
    })
  }
}

const handleEvent = async (event: WebhookEvent): Promise<Message[] | void> => {
  let manager_ = await getManagerByLineId(event.source.userId)
  if (manager_ === undefined) {
    manager_ = await createManager(event.source.userId)
  }
  const manager = manager_ // to make manager constant
  //const action = react(event, manager)
  //action(manager, message)
  if (event.type === 'unfollow') {
    manager.enable = false
    await updateManager(manager)
    return Promise.resolve()
  } else if (event.type === 'follow') {
    if (manager.name === '' || manager.status === managerStatus.INPUT_NAME) {
      return [tellWelcome(), askName()]
    } else {
      manager.enable = true
      await updateManager(manager)
      return [tellWelcomeBack(manager.name)]
    }
  } else if (event.type === 'message') {
    const messages = await react(event, manager)
    return messages
  }
}

const react = async (event: MessageEvent, manager: Manager): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (manager.status) {
      case managerStatus.INPUT_NAME:
        manager.status = managerStatus.CONFIRM_NAME
        manager.name = event.message.text
        await updateManager(manager)
        return [confirmName(manager.name)]

      case managerStatus.CONFIRM_NAME:
        switch (event.message.text) {
          case keyword.yes:
            manager.status = managerStatus.IDLE
            manager.enable = true
            await updateManager(manager)
            return [completeRegister(manager.name)]
          case keyword.no:
            manager.name = ''
            await updateManager(manager)
            return [askNameAgain()]
          default:
            return [TextTemplate(phrase.yesOrNo)]
        }
    }
  } else {
    switch (manager.status) {
      case managerStatus.INPUT_NAME:
        return [askNameAgain()]
    }
  }
  return [TextTemplate(phrase.dontHaveMessage)]
}
