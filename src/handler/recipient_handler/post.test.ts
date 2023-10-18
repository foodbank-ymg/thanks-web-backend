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

test(`line recipient_line/post message`, async () => {
  expect(askImage()).toMatchObject(
    TextTemplate(
      `おたよりに掲載する写真を送信してください。食材を調理したもの、食事の様子または関連する出来事の写真をお願いします。`,
    ),
  )
  expect(confirmImage(2)).toMatchObject(
    TextTemplate(
      `写真を2枚受け取りました。まだ追加できます。全て送信したら、「${keyword.FINISH_IMAGE}」を押してください。`,
    ),
  )

  expect(askSubject()).toMatchObject(
    TextTemplate(
      `この写真に添えるタイトルを一言ください。写真と一緒におたより一覧に表示されます。（例：楽しいクリスマス/イベントでお菓子配布）`,
    ),
  )
  expect(confirmSubject(`タイトル`)).toMatchObject(
    ConfirmTemplate(`タイトルは「タイトル」でいいですか？`, `主題確認`),
  )

  expect(askSubjectAgain()).toMatchObject(
    TextTemplate(`それではもう一度タイトルを入力してください。`),
  )
  expect(askBody()).toMatchObject(
    TextTemplate(
      `最後におたよりの本文として、食材を得てから生まれたストーリーや様子、または寄贈者へのメッセージを送信してください。この文章はおたよりの詳細ページになります。100文字以上ぐらいあると望ましいですが、短い文章でも大丈夫です。`,
    ),
  )
  expect(confirmBody(`本文`)).toMatchObject(
    ConfirmTemplate(`本文は「本文」でいいですか？`, `本文確認`),
  )

  expect(askBodyAgain()).toMatchObject(
    TextTemplate(`お手数ですが、もう一度、本文を入力してください。`),
  )

  expect(confirmPost()).toMatchObject(
    ConfirmTemplate(
      `上記がおたよりのプレビューです。不備や間違いがないか確認して「決定」を押してください。`,
      `投稿確認`,
      [keyword.DECIDE, keyword.DISCARD],
    ),
  )
  expect(completePost()).toMatchObject(
    TextTemplate(
      `おたよりの送信が完了しました。フードバンク事務局が内容を承認後、Webサイトに反映されます。少々お待ちください。`,
    ),
  )
  expect(discardPost()).toMatchObject(
    TextTemplate(
      `おたよりの下書きを削除しました。もう一度始める場合は「おたより投稿」と話しかけてください。`,
    ),
  )
  let conf = loadConfig()

  expect(confirmToApprovePost('hoge', 'rg-0001-230428-161200')).toMatchObject(
    ConfirmTemplatePostback(
      `「hoge」さんが新しいおたよりを投稿しました。ご確認ください。`,
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
  TextTemplate(
    `以前投稿された「hoge」が承認待ちのため、次のおたより投稿を始めることができません。`,
  ),
)
