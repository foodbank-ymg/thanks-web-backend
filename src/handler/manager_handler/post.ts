import { TextTemplate } from '../../lib/line/template'

export const askRejectedReason = () => {
  return TextTemplate(
    '不許可の理由を教えてください。投稿された方に伝えます。\n（例：画像に〇〇が写っています/企業名が誤っています）',
  )
}

export const approvedPostForRecipient = (subject: string) => {
  return TextTemplate(`「${subject}」の投稿が承認されました。数分後にサイトに反映されます。`)
}

export const rejectedPostForRecipient = (subject: string, feedback: string) => {
  return TextTemplate(`${subject}」の投稿が拒否されました。理由は以下の通りです。\n${feedback}`)
}

export const approvedPostForManager = (name: string, subject: string) => {
  return TextTemplate(`「${name}」さんが、「${subject}」の投稿を承認しました。`)
}

export const rejectedPostForManager = (name: string, subject: string) => {
  return TextTemplate(`「${name}」さんが、「${subject}」の投稿を拒否しました。`)
}

export const askPostId = () => {
  return TextTemplate('おたよりIDを入力してください。')
}

export const deletePostSuccess = (subject: string) => {
  return TextTemplate(`「${subject}」の投稿を削除しました。`)
}

export const notFoundPost = () => {
  return TextTemplate('おたよりが見つかりませんでした。')
}

export const postAlreadyApproved = () => {
  return TextTemplate('このおたよりはすでに承認されています。')
}

export const postAlreadyRejected = () => {
  return TextTemplate('このおたよりはすでに却下されています。')
}
