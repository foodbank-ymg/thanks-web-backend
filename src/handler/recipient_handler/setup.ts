import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'

export const tellWelcome = () => {
  return TextTemplate(
    `友だち追加ありがとうございます。\nフードバンク山口「ありがとうWebサイト」のLINEアカウントです。フードバンク山口に食料を寄贈してくださる個人や企業、そして日々の運営を支えてくださるボランティアさんに感謝の気持ちをおたよりとして届けることができます。ぜひご活用ください。`,
  )
}

export const askName = () => {
  return TextTemplate('まず、お名前を教えてください。（サイトには公開されません）')
}

export const tellWelcomeBack = (name: string) => {
  return TextTemplate(`${name}さん、おかえりなさい。`)
}

export const confirmName = (name: string) => {
  return ConfirmTemplate(`お名前は「${name}」でよろしいですか？`, '名前確認')
}

export const askNameAgain = () => {
  return TextTemplate('もう一度お名前を教えてください。')
}

export const completeRegister = (name: string) => {
  return TextTemplate(
    `${name}さんの登録が完了しました。ありがとうございました。\n「ねぇ」「こんにちは」などなんでも話しかけてください。おたよりの投稿を始めることができます。`,
  )
}

export const askRecipientId = () => {
  return TextTemplate('フードバンク山口から払い出された団体IDを入力してください。')
}

export const askRecipientIdAgain = () => {
  return TextTemplate('団体IDが見つかりません。もう一度入力をお願いします。')
}
