import {
  Client,
  Message,
  MessageAPIResponseBase,
  MessageEvent,
  PostbackEvent,
  WebhookEvent,
} from '@line/bot-sdk'
import { Request, Response } from 'express'
import { managerStatus, postStatus, recipientStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import {
  createManager,
  getManagerByLineId,
  getManagersByStationId,
  updateManager,
} from '../../lib/firestore/manager'
import { QuickReplyTemplate, TextTemplate } from '../../lib/line/template'
import { Manager } from '../../types/managers'
import {
  askName,
  askNameAgain,
  askStationId,
  askStationIdAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
} from './setup'
import { PostbackData } from '../../types/postback'
import {
  GetPostById,
  deletePost,
  getWorkingPostByRejectedManagerId,
  updatePost,
} from '../../lib/firestore/post'
import { Push } from '../../lib/line/line'
import {
  askPostId,
  deletePostSuccess,
  notFoundPost,
  approvedPostForManager,
  approvedPostForRecipient,
  rejectedPostForManager,
  rejectedPostForRecipient,
  askRejectedReason,
  postAlreadyRejected,
  postAlreadyApproved,
} from './post'
import { GetRecipientById, updateRecipient } from '../../lib/firestore/recipient'
import { insertLog } from '../../lib/sheet/log'
import { action } from '../../consts/log'
import { deletePostData } from '../../lib/storage/post'
import { postSummary } from '../../lib/sheet/summary'
import moment from 'moment'
import { deploy } from '../../lib/github/github'
import { getStationById } from '../../lib/firestore/station'

export class managerLineHandler {
  constructor(private managerClient: Client, private recipientClient: Client) {}

  async handle(req: Request, res: Response) {
    if (!req.body.events || req.body.events.length === 0) {
      return res.status(200)
    }
    const event: WebhookEvent = req.body.events[0]
    //events[0]のみ対応するかは、まだ検討中

    let result: MessageAPIResponseBase = undefined

    // handleEventが必要なDB処理などを実行しユーザー返答Message配列のPromiseを返してくる。
    // this.clientは渡さなくてよくなる
    const messages = await handleEvent(this.managerClient, this.recipientClient, event).catch(
      (err) => {
        if (err instanceof Error) {
          console.error(err)
          // LINEでエラーの旨を伝えたいので一旦コメントアウト
          // return res.status(500).json({
          // status: 'error',
          //});
          // 異常時は定型メッセージで応答
          return [TextTemplate(phrase.systemError)]
        }
      },
    )

    // 正常時にそのメッセージを返し、結果をmapに集約する

    //eventの種類によってはreplyを行わない。
    if (event.type === 'message' || event.type === 'postback' || event.type === 'follow') {
      if (messages && messages.length > 0)
        result = await this.managerClient.replyMessage(event.replyToken, messages)
    }

    // すべてが終わり、resultsをBodyとしてhttpの200を返してる
    return res.status(200).json({
      status: 'success',
      result,
    })
  }
}

const handleEvent = async (
  managerClient: Client,
  recipientClient: Client,
  event: WebhookEvent,
): Promise<Message[] | void> => {
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
    const messages = await react(recipientClient, managerClient, event, manager)
    return messages
  } else if (event.type === 'postback') {
    const messages = await reactPostback(recipientClient, managerClient, event, manager)
    return messages
  }
}

//: Promise<Message[]>
const reactPostback = async (
  recipientClient: Client,
  managerClient: Client,
  event: PostbackEvent,
  manager: Manager,
): Promise<Message[]> => {
  const data: PostbackData = JSON.parse(event.postback.data)
  const post = await GetPostById(data.target)
  const recipient = await GetRecipientById(post.recipientId)

  switch (data.action) {
    case keyword.APPROVE:
      console.log(`approve: ${post.approvedManagerId}`)
      console.log(`reject: ${post.rejectedManagerId}`)
      if (post.rejectedManagerId != '') {
        return [postAlreadyRejected()]
      } else if (post.approvedManagerId != '') {
        return [postAlreadyApproved()]
      }
      post.status = postStatus.APPROVED
      post.isRecipientWorking = false
      post.approvedAt = moment().utcOffset(9).toDate()
      post.approvedManagerId = manager.id
      await updatePost(post)
      recipient.status = recipientStatus.IDLE
      await updateRecipient(recipient)
      await Push(recipientClient, [recipient.lineId], [approvedPostForRecipient(post.subject)])
      await Push(
        managerClient,
        (await getManagersByStationId(manager.stationId)).map((m) => m.lineId),
        [approvedPostForManager(manager.name, post.subject)],
      )
      await deploy()
      insertLog(manager.name, action.APPROVE_POST, postSummary(post))
      break
    case keyword.REJECT:
      console.log(`approve: ${post.approvedManagerId}`)
      console.log(`reject: ${post.rejectedManagerId}`)
      if (post.rejectedManagerId != '') {
        return [postAlreadyRejected()]
      } else if (post.approvedManagerId != '') {
        return [postAlreadyApproved()]
      }
      post.rejectedManagerId = manager.id
      await updatePost(post)
      manager.status = managerStatus.INPUT_REJECT_REASON
      await updateManager(manager)
      return [askRejectedReason()]
  }
  return []
}

const react = async (
  recipientClient: Client,
  managerClient: Client,
  event: MessageEvent,
  manager: Manager,
): Promise<Message[]> => {
  if (event.message.type === 'text') {
    switch (manager.status) {
      case managerStatus.IDLE:
        switch (event.message.text) {
          case keyword.DELETE_POST:
            manager.status = managerStatus.DELETE_POST
            await updateManager(manager)
            return [askPostId()]
          case keyword.DO_NOTHING:
            return []
          default:
            return [
              QuickReplyTemplate('こんにちは！何をしますか?', [
                keyword.DELETE_POST,
                keyword.DO_NOTHING,
              ]),
            ]
        }
      case managerStatus.INPUT_NAME:
        manager.status = managerStatus.CONFIRM_NAME
        manager.name = event.message.text
        await updateManager(manager)
        return [confirmName(manager.name)]

      case managerStatus.CONFIRM_NAME:
        switch (event.message.text) {
          case keyword.YES:
            manager.status = managerStatus.INPUT_STATION_ID
            await updateManager(manager)
            return [askStationId()]
          case keyword.NO:
            manager.status = managerStatus.INPUT_NAME
            manager.name = ''
            await updateManager(manager)
            return [askNameAgain()]
          default:
            return [TextTemplate(phrase.yesOrNo)]
        }
      case managerStatus.INPUT_STATION_ID:
        const station = await getStationById(event.message.text)
        if (station === undefined) {
          return [askStationIdAgain()]
        } else {
          manager.stationId = station.id
          manager.status = managerStatus.IDLE
          manager.enable = true
          await updateManager(manager)
          return [completeRegister(manager.name)]
        }
      case managerStatus.DELETE_POST:
        const post = await GetPostById(event.message.text)
        manager.status = managerStatus.IDLE
        await updateManager(manager)
        if (post === undefined) {
          return [notFoundPost()]
        } else {
          await deletePost(post)
          deletePostData(post).catch((err) => console.error(err))
          await deploy()
          insertLog(manager.name, action.DELETE_POST, postSummary(post))
          return [deletePostSuccess(post.subject)]
        }
      case managerStatus.INPUT_REJECT_REASON:
        const post_ = await getWorkingPostByRejectedManagerId(manager.id)
        if (post_ === undefined) {
          manager.status = managerStatus.IDLE
          await updateManager(manager)
          console.log('INPUT_REJECT_REASON: post not found')
          return [TextTemplate(phrase.systemError)]
        } else {
          const recipient = await GetRecipientById(post_.recipientId)
          post_.status = postStatus.REJECTED
          post_.feedback = event.message.text
          post_.rejectedAt = moment().utcOffset(9).toDate()
          post_.isRecipientWorking = false
          await updatePost(post_)
          recipient.status = recipientStatus.IDLE
          await updateRecipient(recipient)
          manager.status = managerStatus.IDLE
          await updateManager(manager)
          await Push(
            recipientClient,
            [recipient.lineId],
            [rejectedPostForRecipient(post_.subject, post_.feedback)],
          )
          await Push(
            managerClient,
            (await getManagersByStationId(manager.stationId)).map((m) => m.lineId),
            [rejectedPostForManager(manager.name, post_.subject)],
          )
          insertLog(manager.name, action.REJECT_POST, `${postSummary(post_)}_${post_.feedback}`)
          return []
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
