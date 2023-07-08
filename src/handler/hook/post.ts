import { TextTemplate } from '../../lib/line/template'

export const publishedPost = (subject: string, url: string) => {
  return TextTemplate(
    `「${subject}」の投稿がサイトに反映されました。こちらのURLから確認できます。\n${url}`,
  )
}
