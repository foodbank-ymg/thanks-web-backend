import {
  Client,
  Message,
  MessageAPIResponseBase,
  MessageEvent,
  PostbackEvent,
  WebhookEvent,
} from '@line/bot-sdk'
import { Request, Response } from 'express'
import { managerStatus, postStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import {
  createManager,
  getManagerByLineId,
  getManagers,
  updateManager,
} from '../../lib/firestore/manager'
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
import { PostbackData } from '../../types/postback'
import { GetPostById, updatePost } from '../../lib/firestore/post'
import { Push } from '../../lib/line/line'
import {
  ApprovedPostForManager,
  ApprovedPostForRecipient,
  RejectedPostForManager,
  RejectedPostForRecipient,
} from './post'
import { GetRecipientById } from '../../lib/firestore/recipient'

export class managerLineHandler {
  constructor(private client: Client) {
    this.client = client
  }

  async handle(req: Request, res: Response) {
    if (!req.body.events || req.body.events.length === 0) {
      return res.status(200)
    }
    const event: WebhookEvent = req.body.events[0]
    //events[0]のみ対応するかは、まだ検討中

    let result: MessageAPIResponseBase = undefined

    // handleEventが必要なDB処理などを実行しユーザー返答Message配列のPromiseを返してくる。
    // this.clientは渡さなくてよくなる
    const messages = await handleEvent(this.client, event).catch((err) => {
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
      if (messages) result = await this.client.replyMessage(event.replyToken, messages)
    }

    // すべてが終わり、resultsをBodyとしてhttpの200を返してる
    return res.status(200).json({
      status: 'success',
      result,
    })
  }
}

const handleEvent = async (client: Client, event: WebhookEvent): Promise<Message[] | void> => {
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
  } else if (event.type === 'postback') {
    const messages = await reactPostback(client, event, manager)
    return messages
  }
}

//: Promise<Message[]>
const reactPostback = async (client: Client, event: PostbackEvent, manager: Manager) => {
  let data: PostbackData = JSON.parse(event.postback.data)
  let post = await GetPostById(data.target)
  switch (data.action) {
    case keyword.APPROVE:
      post.status = postStatus.APPROVED
      post.isRecipientWorking = false
      await updatePost(post)
      Push(
        client,
        [(await GetRecipientById(post.recipientId)).lineId],
        [ApprovedPostForRecipient(manager.name, post.subject)],
      )
      Push(
        client,
        (await getManagers()).map((m) => m.lineId),
        [ApprovedPostForManager(manager.name, post.subject)],
      )
    case keyword.REJECT:
      post.status = postStatus.REJECTED
      post.isRecipientWorking = false
      await updatePost(post)
      Push(
        client,
        [(await GetRecipientById(post.recipientId)).lineId],
        [RejectedPostForRecipient(manager.name, post.subject)],
      )
      Push(
        client,
        (await getManagers()).map((m) => m.lineId),
        [RejectedPostForManager(manager.name, post.subject)],
      )
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
          case keyword.YES:
            manager.status = managerStatus.IDLE
            manager.enable = true
            await updateManager(manager)
            return [completeRegister(manager.name)]
          case keyword.NO:
            manager.status = managerStatus.INPUT_NAME
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
