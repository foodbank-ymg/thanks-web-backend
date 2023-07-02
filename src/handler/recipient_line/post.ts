import { keyword } from '../../consts/keyword'
import { ConfirmTemplate, QuickReplyTemplate, TextTemplate } from '../../lib/line/template'

export const askSubject = () => {
  return TextTemplate(`まず、主題を入力してください。`)
}

export const confirmSubject = (subject: string) => {
  return ConfirmTemplate(`主題は「${subject}」でよろしいですか？`, `主題確認`)
}

export const askSubjectAgain = () => {
  return TextTemplate(`もう一度、主題を入力してください。`)
}

export const askBody = () => {
  return TextTemplate(`次に、本文を入力してください。`)
}

export const confirmBody = (body: string) => {
  return ConfirmTemplate(`本文は「${body}」でよろしいですか？`, `本文確認`)
}

export const askBodyAgain = () => {
  return TextTemplate(`もう一度、本文を入力してください。`)
}

export const askImage = () => {
  return TextTemplate(`次に、画像を一枚づつ送信してください。3枚まで追加できます。`)
}

export const confirmImage = (len: number) => {
  return QuickReplyTemplate(
    `${len}枚受け取りました。まだ画像を追加できます。\n全て投稿したら、「${keyword.FINISH_IMAGE}」を押してください。`,
    [keyword.FINISH_IMAGE],
  )
}

export const confirmPost = () => {
  return ConfirmTemplate(
    `全ての記入が完了しました。\n投稿内容に間違いがないか、最後にもう一度ご確認ください。`,
    `投稿確認`,
    [keyword.DECIDE, keyword.DISCARD],
  )
}

export const completePost = () => {
  return TextTemplate(
    `記事の送信が完了しました。事務局が投稿内容を承認後、翌月の初めに表示されるようになります。`,
  )
}

export const discardPost = () => {
  return TextTemplate(
    `記事の下書きを削除しました。もう一度投稿する場合は「記事投稿」と話しかけてください。`,
  )
}
