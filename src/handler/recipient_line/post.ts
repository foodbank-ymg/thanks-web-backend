import { FlexMessage } from '@line/bot-sdk'
import { keyword } from '../../consts/keyword'
import { ConfirmTemplate, QuickReplyTemplate, TextTemplate } from '../../lib/line/template'
import { GetUrl } from '../../lib/storage/storage'

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
  return TextTemplate(
    `全ての記入が完了しました。\n投稿内容に間違いがないか、最後にもう一度ご確認ください。`,
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

export const AskPostReview = (name: string) => {
  return TextTemplate(`「${name}」さんが新しい記事を投稿しました。ご確認ください。`)
}

export const PostPreview = (subject: string, body: string, images: string[], options: string[]) => {
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
  let imageObjects = []
  if (images.length > 1) {
    imageObjects = images.slice(1).map((image) => {
      return {
        type: 'image',
        url: GetUrl(image),
        size: 'full',
        aspectRatio: '20:13',
      }
    })
  }
  let optionObjects = options.map((option) => {
    return {
      type: 'button',
      style: 'link',
      height: 'sm',
      action: {
        type: 'message',
        label: option,
        text: option,
      },
    }
  })

  return {
    type: 'flex',
    altText: 'This is a Flex Message',
    contents: {
      type: 'bubble',
      hero: hero,
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: imageObjects,
            paddingAll: 'none',
          },
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
            paddingBottom: 'none',
            paddingAll: 'xxl',
          },
        ],
        paddingAll: 'none',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: optionObjects,
        flex: 0,
      },
    },
  } as FlexMessage
}
