import { Message } from '@line/bot-sdk'
import { Manager } from '../../types/managers'

export const newManager = (manager: Manager) => {
  const message: Message = {
    type: 'text',
    text: 'お名前を教えてください。※この情報はWebサイトには表示されません。',
  }
  return message
}

export const returningManager = (manager: Manager) => {
  const message: Message = {
    type: 'text',
    text: `${manager.name}さん、お帰りなさい！`,
  }
  return message
}
