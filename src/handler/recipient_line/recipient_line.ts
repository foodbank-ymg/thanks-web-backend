import { Client, Message, MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { recipientStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { getRecipientGroupById } from '../../lib/firestore/recipientGroup'
import {
  createRecipient,
  getRecipientByLineId,
  updateRecipient,
} from '../../lib/firestore/recipient'
import { TextTemplate } from '../../lib/line/template'
import { Recipient } from '../../types/recipient'
import {
  askName,
  askNameAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
  askRecipientId,
  askRecipientIdAgain,
} from './setup'

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
            // return res.recipientStatus(500).json({
            // recipientStatus: 'error',
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

export const handleEvent = async (event: WebhookEvent): Promise<Message[] | void> => {
  let recipient = await getRecipientByLineId(event.source.userId)
  if (recipient === undefined) {
    recipient = await createRecipient(event.source.userId)
  }

  //const action = react(event, manager)
  //action(manager, message)
  if (event.type === 'unfollow') {
    recipient.enable = false
    await updateRecipient(recipient)
    return Promise.resolve()
  } else if (event.type === 'follow') {
    if (recipient.name === '') {
      recipient.status = recipientStatus.INPUT_NAME
      await updateRecipient(recipient)
      return [tellWelcome(), askName()]
    } else if (recipient.recipientGroupId === '') {
      recipient.status = recipientStatus.INPUT_RECIPIENT_ID
      await updateRecipient(recipient)
      return [tellWelcome(), askRecipientId()]
    } else {
      recipient.enable = true
      await updateRecipient(recipient)
      return [tellWelcomeBack(recipient.name)]
    }
  } else if (event.type === 'message') {
    const messages = await react(event, recipient)
    return messages
  }
}

const react = async (event: MessageEvent, recipient: Recipient): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (recipient.status) {
      case recipientStatus.INPUT_NAME:
        switch (event.message.text) {
          case keyword.yes:
            recipient.status = recipientStatus.INPUT_RECIPIENT_ID
            await updateRecipient(recipient)
            return [askRecipientId()]
          case keyword.no:
            recipient.name = ''
            await updateRecipient(recipient)
            return [askNameAgain()]
          default:
            recipient.name = event.message.text
            await updateRecipient(recipient)
            return [confirmName(recipient.name)]
        }
      case recipientStatus.INPUT_RECIPIENT_ID:
        const recipientGroup = await getRecipientGroupById(event.message.text)
        if (recipientGroup === undefined) {
          return [askRecipientIdAgain()]
        } else {
          recipient.recipientGroupId = recipientGroup.id
          recipient.status = recipientStatus.IDLE
          recipient.enable = true
          await updateRecipient(recipient)
          return [completeRegister(recipient.name)]
        }
    }
  } else {
    switch (recipient.status) {
      case recipientStatus.INPUT_NAME:
        return [askNameAgain()]
    }
  }
  return [TextTemplate(phrase.dontHaveMessage)]
}
