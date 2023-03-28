import { Client, Message, MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { status } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { getRecipientById } from '../../lib/firestore/recipient'
import {
  createRecipientMember,
  getRecipientByLineId,
  updateRecipientMember,
} from '../../lib/firestore/recipientMember'
import { TextTemplate } from '../../lib/line/template'
import { RecipientMember } from '../../types/recipientMember'
import {
  askName,
  askNameAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
} from '../common/setup'
import { askRecipientId, askRecipientIdAgain } from './setup'

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
  let recipient_ = await getRecipientByLineId(event.source.userId)
  if (recipient_ === undefined) {
    recipient_ = await createRecipientMember(event.source.userId)
  }
  const recipient = recipient_ // to make manager constant
  //const action = react(event, manager)
  //action(manager, message)
  if (event.type === 'unfollow') {
    recipient.enable = false
    await updateRecipientMember(recipient)
    return Promise.resolve()
  } else if (event.type === 'follow') {
    if (recipient.name === '' || recipient.status === status.inputName) {
      recipient.status = status.inputName
      await updateRecipientMember(recipient)
      return [tellWelcome(), askName()]
    } else if (recipient.recipientId === '' || recipient.status === status.inputRecipientId) {
      recipient.status = status.inputRecipientId
      await updateRecipientMember(recipient)
      return [tellWelcome(), askRecipientId()]
    } else {
      recipient.enable = true
      await updateRecipientMember(recipient)
      return [tellWelcomeBack(recipient.name)]
    }
  } else if (event.type === 'message') {
    const messages = await react(event, recipient)
    return messages
  }
}

const react = async (event: MessageEvent, recipient: RecipientMember): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (recipient.status) {
      case status.inputName:
        switch (event.message.text) {
          case keyword.yes:
            if (recipient.recipientId === '') {
              recipient.status = status.inputRecipientId
              await updateRecipientMember(recipient)
              return [askRecipientId()]
            } else {
              recipient.status = status.idle
              recipient.enable = true
              await updateRecipientMember(recipient)
              return [completeRegister(recipient.name)]
            }
          case keyword.no:
            recipient.name = ''
            await updateRecipientMember(recipient)
            return [askNameAgain()]
          default:
            recipient.name = event.message.text
            await updateRecipientMember(recipient)
            return [confirmName(recipient.name)]
        }
      case status.inputRecipientId:
        const recipientGroup = await getRecipientById(event.message.text)
        if (recipientGroup === undefined) {
          return [askRecipientIdAgain()]
        } else {
          recipient.recipientId = recipientGroup.id
          recipient.status = status.idle
          recipient.enable = true
          await updateRecipientMember(recipient)
          return [completeRegister(recipient.name)]
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
