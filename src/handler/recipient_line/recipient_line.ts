import { Client, Message, MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { postStatus, recipientStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { getRecipientGroupById } from '../../lib/firestore/recipientGroup'
import {
  createRecipient,
  getRecipientByLineId,
  updateRecipient,
} from '../../lib/firestore/recipient'
import { QuickReplyTemplate, TextTemplate } from '../../lib/line/template'
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
import { reactPostImage, reactPostText } from './post_line'
import { createPost, getWorkingPostByRecipientId, updatePost } from '../../lib/firestore/post'
import { askSubject } from './post'
import { Post } from '../../types/post'

export var client: Client | undefined

export class recipientLineHandler {
  constructor(private client_: Client) {
    client = client_
  }

  async handle(req: Request, res: Response) {
    const events: WebhookEvent[] = req.body.events
    //events[0]のみ対応するかは、まだ検討中

    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        // handleEventが必要なDB処理などを実行しユーザー返答Message配列のPromiseを返してくる。
        // this.clientは渡さなくてよくなる
        const messages = await handleEvent(client, event).catch((err) => {
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
          if (messages) return client.replyMessage(event.replyToken, messages)
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

export const handleEvent = async (
  client: Client,
  event: WebhookEvent,
): Promise<Message[] | void> => {
  let recipient = await getRecipientByLineId(event.source.userId)
  if (recipient === undefined) {
    recipient = await createRecipient(event.source.userId)
  }
  let post = undefined
  if (recipient.status === recipientStatus.INPUT_POST) {
    post = await getWorkingPostByRecipientId(recipient.id)
    if (post === undefined) {
      //TODO return data inconsistent error
    }
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
    const messages = await react(client, event, recipient, post)
    return messages
  }
}

const react = async (
  client: Client,
  event: MessageEvent,
  recipient: Recipient,
  post: Post,
): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (recipient.status) {
      case recipientStatus.IDLE:
        switch (event.message.text) {
          case keyword.POST:
            recipient.status = recipientStatus.INPUT_POST
            post = await getWorkingPostByRecipientId(event.source.userId)
            if (post === undefined) {
              post = await createPost(recipient)
              await updatePost(post)
            }
            await updateRecipient(recipient)
            return [askSubject()]
          default:
            return [QuickReplyTemplate('こんにちは！何をしますか?', ['記事投稿', '何もしない'])]
        }
      case recipientStatus.INPUT_NAME:
        recipient.status = recipientStatus.CONFIRM_NAME
        recipient.name = event.message.text
        await updateRecipient(recipient)
        return [confirmName(recipient.name)]
      case recipientStatus.CONFIRM_NAME:
        switch (event.message.text) {
          case keyword.YES:
            recipient.status = recipientStatus.INPUT_RECIPIENT_ID
            await updateRecipient(recipient)
            return [askRecipientId()]
          case keyword.NO:
            recipient.status = recipientStatus.INPUT_NAME
            recipient.name = ''
            await updateRecipient(recipient)
            return [askNameAgain()]
          default:
            return [TextTemplate(phrase.yesOrNo)]
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
      case recipientStatus.INPUT_POST:
        return reactPostText(event.message.text, recipient, post)
    }
  } else if (event.message.type === 'image') {
    switch (recipient.status) {
      case recipientStatus.INPUT_POST:
        let image = await downloadImageById(client, event.message.id)
        return reactPostImage(image, post)
    }
  } else {
    switch (recipient.status) {
      case recipientStatus.INPUT_NAME:
        return [askNameAgain()]
    }
  }

  return [TextTemplate('すみません。この操作はできません。')]
}

const downloadImageById = async (client: Client, id: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    client.getMessageContent(id).then((stream) => {
      const content = []
      stream
        .on('data', (chunk) => {
          content.push(Buffer.from(chunk))
        })
        .on('error', reject)
        .on('end', () => {
          resolve(Buffer.concat(content))
        })
    })
  })
}
