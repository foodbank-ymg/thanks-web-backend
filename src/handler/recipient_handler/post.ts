import { FlexMessage } from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'
import {
  ConfirmTemplate,
  ConfirmTemplatePostback,
  NewPostbackAction,
  QuickReplyTemplate,
  TextTemplate,
} from '../../lib/line/template'
import { GetUrl } from '../../lib/storage/storage'
import { PostbackData } from '../../types/postback'

export const askImage = () => {
  return TextTemplate(
    `おたよりに掲載する写真を送信してください。食材を調理したもの、食事の様子または関連する出来事の写真をお願いします。`,
  )
}

export const confirmImage = (len: number) => {
  return QuickReplyTemplate(
    `写真を${len}枚受け取りました。まだ追加できます。全て送信したら、「${keyword.FINISH_IMAGE}」を押してください。`,
    [keyword.FINISH_IMAGE],
  )
}

export const askSubject = () => {
  return TextTemplate(
    `この写真に添えるタイトルを一言ください。写真と一緒におたより一覧に表示されます。（例：楽しいクリスマス/イベントでお菓子配布）`,
  )
}

export const confirmSubject = (subject: string) => {
  return ConfirmTemplate(`タイトルは「${subject}」でいいですか？`, `主題確認`)
}

export const askSubjectAgain = () => {
  return TextTemplate(`それではもう一度タイトルを入力してください。`)
}

export const askBody = () => {
  return TextTemplate(
    `最後におたよりの本文として、食材を得てから生まれたストーリーや様子、または寄贈者へのメッセージを送信してください。この文章はおたよりの詳細ページになります。100文字以上ぐらいあると望ましいですが、短い文章でも大丈夫です。`,
  )
}

export const confirmBody = (body: string) => {
  return ConfirmTemplate(`本文は「${body}」でいいですか？`, `本文確認`)
}

export const askBodyAgain = () => {
  return TextTemplate(`お手数ですが、もう一度、本文を入力してください。`)
}

export const confirmPost = () => {
  return ConfirmTemplate(
    `上記がおたよりのプレビューです。不備や間違いがないか確認して「${keyword.DECIDE}」を押してください。`,
    `投稿確認`,
    [keyword.DECIDE, keyword.DISCARD],
  )
}

export const completePost = () => {
  return TextTemplate(
    `おたよりの送信が完了しました。フードバンク事務局が内容を承認後、Webサイトに反映されます。少々お待ちください。`,
  )
}

export const discardPost = () => {
  return TextTemplate(
    `おたよりの下書きを削除しました。もう一度始める場合は「おたより投稿」と話しかけてください。`,
  )
}

export const confirmToApprovePost = (name: string, postId: string) => {
  return ConfirmTemplatePostback(
    `「${name}」さんが新しいおたよりを投稿しました。ご確認ください。`,
    `投稿承認`,
    [
      NewPostbackAction(
        keyword.APPROVE,
        JSON.stringify({ action: keyword.APPROVE, target: postId } as PostbackData),
      ),
      NewPostbackAction(
        keyword.REJECT,
        JSON.stringify({ action: keyword.REJECT, target: postId } as PostbackData),
      ),
    ],
  )
}

export const previewPost = (subject: string, body: string, images: string[]) => {
  let hero = undefined
  if (images.length > 0) {
    hero = {
      type: 'image',
      url: GetUrl(images[0]),
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
    }
  }

  return {
    type: 'flex',
    altText: '投稿プレビュー',
    contents: {
      type: 'bubble',
      hero: hero,
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: subject,
                size: 'xl',
                weight: 'bold',
                margin: 'none',
                wrap: true,
              },
              {
                type: 'text',
                text: body,
                margin: 'md',
                wrap: true,
              },
            ],
            paddingAll: 'xxl',
          },
        ],
        paddingAll: 'none',
      },
    },
  } as FlexMessage
}

export const cannotPost = (subject: string) => {
  return TextTemplate(
    `以前投稿された「${subject}」が承認待ちのため、次のおたより投稿を始めることができません。`,
  )
}
