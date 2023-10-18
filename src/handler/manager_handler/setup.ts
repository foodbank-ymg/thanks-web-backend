import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'

export const tellWelcome = () => {
  return TextTemplate(
    `友だち追加ありがとうございます。\nこのアカウントでは、投稿されたおたよりの管理ができます。`,
  )
}

export const askName = () => {
  return TextTemplate('まず、お名前を教えてください。（サイトには公開されません）')
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

export const askStationId = () => {
  return TextTemplate('事前に伝えられた拠点IDを入力してください。')
}

export const askStationIdAgain = () => {
  return TextTemplate('拠点IDが見つかりません。もう一度入力をお願いします。')
}

export const completeRegister = (name: string) => {
  return TextTemplate(
    `登録が完了しました。「${name}」さん、ありがとうございました。投稿されたおたよりの管理をすることができます。`,
  )
}
