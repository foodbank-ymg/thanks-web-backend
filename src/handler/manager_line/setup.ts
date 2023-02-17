import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'

export const tellWelcome = () => {
  return TextTemplate(
    `友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。`,
  )
}

export const askName = () => {
  return TextTemplate(
    '早速ですが、お名前を教えてください。※この情報はWebサイトには表示されません。',
  )
}

export const tellWelcomeBack = (name: string) => {
  return TextTemplate(`${name}さん、おかえりなさい。`)
}

export const confirmName = (name: string) => {
  return ConfirmTemplate(`お名前は${name}でよろしいですか？`, '名前確認')
}

export const askNameAgain = () => {
  return TextTemplate('もう一度お名前を教えてください。')
}

export const decideName = (name: string) => {
  return TextTemplate(`${name}さん、よろしくお願いします。`)
}
