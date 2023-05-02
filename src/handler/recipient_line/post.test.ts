import { keyword } from '../../consts/keyword'
import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'
import {
  askBody,
  askBodyAgain,
  askImage,
  askSubject,
  askSubjectAgain,
  completePost,
  confirmBody,
  confirmImage,
  confirmPost,
  confirmSubject,
  discardPost,
} from './post'

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
    TextTemplate(`次に、画像を一枚づつ送信してください。3枚まで追加できます。`),
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
    TextTemplate(
      `記事の送信が完了しました。事務局が投稿内容を承認後、翌月の初めに表示されるようになります。`,
    ),
  )
  expect(discardPost()).toMatchObject(
    TextTemplate(
      `記事の下書きを削除しました。もう一度投稿する場合は「記事投稿」と話しかけてください。`,
    ),
  )
})
