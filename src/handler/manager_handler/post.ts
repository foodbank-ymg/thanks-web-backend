import { TextTemplate } from '../../lib/line/template'

export const ApprovedPostForRecipient = (name: string, subject: string) => {
  return TextTemplate(`「${subject}」の投稿が承認されました。来月の初めに表示される様になります。`)
}

export const RejectedPostForRecipient = (name: string, subject: string) => {
  return TextTemplate(
    `「${subject}」の投稿が拒否されました。投稿内容を修正の上、再度投稿してください。`,
  )
}

export const ApprovedPostForManager = (name: string, subject: string) => {
  return TextTemplate(`「${name}」さんが、「${subject}」の投稿を承認しました。`)
}

export const RejectedPostForManager = (name: string, subject: string) => {
  return TextTemplate(`「${name}」さんが、「${subject}」の投稿を拒否しました。`)
}
