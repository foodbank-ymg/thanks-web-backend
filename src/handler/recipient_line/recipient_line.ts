import { Client, Message, MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { Request, Response } from 'express';
import { status } from '../../consts/constants';
import { keyword } from '../../consts/keyword';
import { phrase } from '../../consts/phrase';
import { createRecipient, getRecipientByLineId, updateRecipient } from '../../lib/firestore/recipient';
import { TextTemplate } from '../../lib/line/template';
import { Recipient } from '../../types/recipient';
import { askName, askNameAgain, confirmName, decideName, tellWelcome, tellWelcomeBack } from './setup';

export class recipientLineHandler {
  constructor(private client: Client) {}

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
  let manager_ = await getRecipientByLineId(event.source.userId)
  if (manager_ === undefined) {
    manager_ = await createRecipient(event.source.userId)
  }
  const manager = manager_ // to make manager constant
  //const action = react(event, manager)
  //action(manager, message)
  if (event.type === 'unfollow') {
    manager.enable = false
    await updateRecipient(manager)
    return Promise.resolve()
  } else if (event.type === 'follow') {
    if (manager.name === '' || manager.status === status.inputName) {
      return [tellWelcome(), askName()]
    } else {
      manager.enable = true
      await updateRecipient(manager)
      return [tellWelcomeBack(manager.name)]
    }
  } else if (event.type === 'message') {
    const messages = await react(event, manager)
    return messages
  }
}

const react = async (event: MessageEvent, recipient: Recipient): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (recipient.status) {
      case status.inputName:
        switch (event.message.text) {
          case keyword.yes:
            recipient.status = status.idle
            recipient.enable = true
            await updateRecipient(recipient)
            return [decideName(recipient.name)]
          case keyword.no:
            recipient.name = ''
            await updateRecipient(recipient)
            return [askNameAgain()]
          default:
            recipient.name = event.message.text
            await updateRecipient(recipient)
            return [confirmName(recipient.name)]
        }
    }
  } else {
    switch (recipient.status) {
      case status.inputName:
        return [askNameAgain()]
    }
  }
  return [TextTemplate(phrase.dontHaveMessage)]
}
