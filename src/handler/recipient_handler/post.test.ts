import { loadConfig } from '../../config/config'
import { keyword } from '../../consts/keyword'
import {
  ConfirmTemplate,
  ConfirmTemplatePostback,
  NewPostbackAction,
  TextTemplate,
} from '../../lib/line/template'
import { PostbackData } from '../../types/postback'
import {
  askBody,
  askBodyAgain,
  askImage,
  confirmToApprovePost,
  askSubject,
  askSubjectAgain,
  cannotPost,
  completePost,
  confirmBody,
  confirmImage,
  confirmPost,
  confirmSubject,
  discardPost,
  previewPost,
} from './post'
import { IMAGE_MAX } from './post_handler'

test(`line recipient_line/post message`, async () => {
  expect(askSubject()).toMatchObject(TextTemplate(`まず、主題を入力してください。`))
  expect(confirmSubject(`タイトル`)).toMatchObject(
    ConfirmTemplate(`主題は「タイトル」でよろしいですか？`, `主題確認`),
  )

  expect(askSubjectAgain()).toMatchObject(TextTemplate(`もう一度、主題を入力してください。`))
  expect(askBody()).toMatchObject(TextTemplate(`次に、本文を入力してください。`))
  expect(confirmBody(`本文`)).toMatchObject(
    ConfirmTemplate(`本文は「本文」でよろしいですか？`, `本文確認`),
  )

  expect(askBodyAgain()).toMatchObject(TextTemplate(`もう一度、本文を入力してください。`))

  expect(askImage()).toMatchObject(
    TextTemplate(`次に、画像を一枚づつ送信してください。${IMAGE_MAX}枚まで追加できます。`),
  )
  expect(confirmImage(2)).toMatchObject(
    TextTemplate(
      `2枚受け取りました。まだ画像を追加できます。\n全て投稿したら、「${keyword.FINISH_IMAGE}」を押してください。`,
    ),
  )
  expect(confirmPost()).toMatchObject(
    ConfirmTemplate(
      `全ての記入が完了しました。\n投稿内容に間違いがないか、最後にもう一度ご確認ください。`,
      `投稿確認`,
      [keyword.DECIDE, keyword.DISCARD],
    ),
  )
  expect(completePost()).toMatchObject(
    TextTemplate(`記事の送信が完了しました。事務局が投稿内容を承認後、サイトに反映されます。`),
  )
  expect(discardPost()).toMatchObject(
    TextTemplate(
      `記事の下書きを削除しました。もう一度投稿する場合は「記事投稿」と話しかけてください。`,
    ),
  )
  let conf = loadConfig()

  expect(confirmToApprovePost('hoge', 'rg-0001-230428-161200')).toMatchObject(
    ConfirmTemplatePostback(
      `「hoge」さんが新しい記事を投稿しました。ご確認ください。`,
      `投稿承認`,
      [
        NewPostbackAction(
          keyword.APPROVE,
          JSON.stringify({
            action: keyword.APPROVE,
            target: 'rg-0001-230428-161200',
          } as PostbackData),
        ),
        NewPostbackAction(
          keyword.REJECT,
          JSON.stringify({
            action: keyword.REJECT,
            target: 'rg-0001-230428-161200',
          } as PostbackData),
        ),
      ],
    ),
  )

  expect(
    previewPost(`タイトル`, `本文`, [`images/2301/25ot.png`, `images/2211/24py.png`]),
  ).toMatchObject({
    type: 'flex',
    altText: '投稿プレビュー',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: `https://storage.googleapis.com/${conf.projectId}.appspot.com/images%2F2301%2F25ot.png`,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
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
                text: 'タイトル',
                size: 'xl',
                weight: 'bold',
                margin: 'none',
                wrap: true,
              },
              {
                type: 'text',
                text: '本文',
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
  })
})

expect(cannotPost(`hoge`)).toMatchObject(
  TextTemplate(`以前投稿された「hoge」が承認待ちのため、投稿できません。`),
)
