import { TextTemplate } from '../../lib/line/template'

export const askRecipientId = () => {
  return TextTemplate('フードバンク山口から払い出された団体IDを入力してください。')
}

export const askRecipientIdAgain = () => {
  return TextTemplate('団体IDが見つかりません。もう一度入力をお願いします。')
}
