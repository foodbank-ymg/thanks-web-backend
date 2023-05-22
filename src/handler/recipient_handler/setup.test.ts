
import {
  askName,
  askNameAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
  askRecipientId,
  askRecipientIdAgain,
} from './setup'

test('line recipient_line/setup message', async () => {
  expect(tellWelcome()).toMatchObject({
    type: 'text',
    text: '友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。',
  })
  expect(askName()).toMatchObject({
    type: 'text',
    text: 'まず、お名前を教えてください。（サイトには公開されません）',
  })

  expect(tellWelcomeBack('name')).toMatchObject({
    type: 'text',
    text: '「name」さん、おかえりなさい。',
  })
  expect(confirmName('hoge')).toMatchObject({
    type: 'template',
    altText: '名前確認',
    template: {
      type: 'confirm',
      actions: [
        { type: 'message', label: 'はい', text: 'はい' },
        { type: 'message', label: 'いいえ', text: 'いいえ' },
      ],
      text: 'お名前は「hoge」でよろしいですか？',
    },
  })
  expect(askNameAgain()).toMatchObject({
    type: 'text',
    text: 'もう一度お名前を教えてください。',
  })

  expect(completeRegister('foo')).toMatchObject({
    type: 'text',
    text: '登録が完了しました。「foo」さん、ありがとうございました。投稿することができます。',
  })

  expect(askRecipientId()).toMatchObject({
    type: 'text',
    text: 'フードバンク山口から払い出された団体IDを入力してください。',
  })
  expect(askRecipientIdAgain()).toMatchObject({
    type: 'text',
    text: '団体IDが見つかりません。もう一度入力をお願いします。',
  })
})
