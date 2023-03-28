import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'

export const tellWelcome = () => {
  return TextTemplate(
    `友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。`,
  )
}

export const askName = () => {
  return TextTemplate('お名前を教えてください。（サイトには公開されません）')
}

export const tellWelcomeBack = (name: string) => {
  return TextTemplate(`「${name}」さん、おかえりなさい。`)
}

export const confirmName = (name: string) => {
  return ConfirmTemplate(`お名前は「${name}」でよろしいですか？`, '名前確認')
}

export const askNameAgain = () => {
  return TextTemplate('もう一度お名前を教えてください。')
}

export const completeRegister = (name: string) => {
  return TextTemplate(
    `登録が完了しました。「${name}」さん、ありがとうございました。投稿することができます。`,
  )
}
