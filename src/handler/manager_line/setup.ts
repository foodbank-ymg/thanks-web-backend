import {
  Message,
  MessageEvent,
  TemplateMessage,
  TextEventMessage,
  TextMessage,
  WebhookEvent,
} from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'
import { ConfirmTemplate } from '../../lib/line/template'
import { Manager } from '../../types/managers'

export const newManager = (event: MessageEvent, manager: Manager) => {
  const message: TextMessage = {
    type: 'text',
    text: 'お名前を教えてください。※この情報はWebサイトには表示されません。',
  }
  return message
}

export const returningManager = (event: MessageEvent, manager: Manager) => {
  const message: TextMessage = {
    type: 'text',
    text: `${manager.name}さん、お帰りなさい！`,
  }
  manager.enable = true
  return message
}

export const confirmName = (event: MessageEvent, manager: Manager) => {
  if (event.message.type !== 'text') return

  manager.name = event.message.text
  return ConfirmTemplate(`お名前は${event.message.text}でよろしいですか？`, '名前確認')
}

export const askNameAgain = (event: MessageEvent, manager: Manager) => {
  if (event.message.type !== 'text') return
  const message: TextMessage = {
    type: 'text',
    text: 'もう一度お名前を教えてください',
  }
  manager.name = ''
  return message
}

export const decideName = (event: MessageEvent, manager: Manager) => {
  if (event.message.type !== 'text') return
  const message: TextMessage = {
    type: 'text',
    text: `${manager.name}さん、よろしくお願いします。`,
  }
  manager.status = ''
  manager.enable = true
  return message
}
