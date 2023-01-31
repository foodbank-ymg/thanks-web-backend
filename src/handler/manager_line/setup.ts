import {
  FollowEvent,
  Message,
  MessageEvent,
  TemplateMessage,
  TextEventMessage,
  TextMessage,
  WebhookEvent,
} from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'
import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'
import { Manager } from '../../types/managers'

export const tellWelcome = (event: WebhookEvent) => {
  return TextTemplate(
    `友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。`,
  )
}

export const askName = () => {
  const message: TextMessage = {
    type: 'text',
    text: '早速ですが、お名前を教えてください。※この情報はWebサイトには表示されません。',
  }
  return message
}

export const tellWelcomeBack = (manager: Manager) => {
  const message: TextMessage = {
    type: 'text',
    text: `${manager.name}さん、お帰りなさい！`,
  }
  return message
}

export const confirmName = (event: MessageEvent) => {
  if (event.message.type !== 'text') return
  return ConfirmTemplate(`お名前は${event.message.text}でよろしいですか？`, '名前確認')
}

export const askNameAgain = (event: MessageEvent) => {
  if (event.message.type !== 'text') return
  const message: TextMessage = {
    type: 'text',
    text: 'もう一度お名前を教えてください',
  }
  return message
}

export const decideName = (event: MessageEvent, manager: Manager) => {
  if (event.message.type !== 'text') return
  const message: TextMessage = {
    type: 'text',
    text: `${manager.name}さん、よろしくお願いします。`,
  }

  return message
}
