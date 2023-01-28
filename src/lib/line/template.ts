import { TemplateMessage } from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'

export const ConfirmTemplate = (text: string, alt: string) => {
  const message: TemplateMessage = {
    type: 'template',
    altText: alt,
    template: {
      type: 'confirm',
      actions: [
        { type: 'message', label: keyword.yes, text: keyword.yes },
        { type: 'message', label: keyword.no, text: keyword.no },
      ],
      text: text,
    },
  }
  return message
}
