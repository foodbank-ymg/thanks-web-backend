import { QuickReplyItem, TemplateMessage, TextMessage } from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'

export const ConfirmTemplate = (text: string, alt: string, option?: string[]) => {
  let yes = keyword.YES
  let no = keyword.NO
  if (typeof option !== 'undefined') {
    yes = option[0]
    no = option[1]
  }
  const message: TemplateMessage = {
    type: 'template',
    altText: alt,
    template: {
      type: 'confirm',
      actions: [
        { type: 'message', label: yes, text: yes },
        { type: 'message', label: no, text: no },
      ],
      text: text,
    },
  }
  return message
}

export const TextTemplate = (text: string) => {
  const message: TextMessage = {
    type: 'text',
    text: text,
  }
  return message
}

export const QuickReplyTemplate = (text: string, items_: string[]) => {
  const items = items_.map((item) => {
    return {
      type: 'action', // ③
      action: {
        type: 'message',
        label: item,
        text: item,
      },
    } as QuickReplyItem
  })
  const message: TextMessage = {
    type: 'text', // ①
    text: text,
    quickReply: {
      // ②
      items: items,
    },
  }
  return message
}
