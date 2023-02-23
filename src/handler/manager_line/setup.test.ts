import {
  askName,
  askNameAgain,
  confirmName,
  decideName,
  tellWelcome,
  tellWelcomeBack,
} from './setup'

test('line setup message', async () => {
  expect(tellWelcome()).toMatchObject({
    type: 'text',
    text: '友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。',
  })
  expect(askName()).toMatchObject({
    type: 'text',
    text: '早速ですが、お名前を教えてください。※この情報はWebサイトには表示されません。',
  })

  expect(tellWelcomeBack('name')).toMatchObject({
    type: 'text',
    text: 'nameさん、おかえりなさい。',
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
      text: 'お名前はhogeでよろしいですか？',
    },
  })
  expect(askNameAgain()).toMatchObject({
    type: 'text',
    text: 'もう一度お名前を教えてください。',
  })

  expect(decideName('foo')).toMatchObject({ type: 'text', text: 'fooさん、よろしくお願いします。' })
})
