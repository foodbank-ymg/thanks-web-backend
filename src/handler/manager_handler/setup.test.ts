import {
  askName,
  askNameAgain,
  askStationId,
  askStationIdAgain,
  completeRegister,
  confirmName,
  tellWelcome,
  tellWelcomeBack,
} from './setup'

test('line manager_line/setup message', async () => {
  expect(tellWelcome()).toMatchObject({
    type: 'text',
    text: '友だち追加ありがとうございます。\nこのアカウントでは、投稿されたおたよりの管理ができます。',
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

  expect(askStationId()).toMatchObject({
    type: 'text',
    text: '事前に伝えられた拠点IDを入力してください。',
  })

  expect(askStationIdAgain()).toMatchObject({
    type: 'text',
    text: '拠点IDが見つかりません。もう一度入力をお願いします。',
  })

  expect(completeRegister('foo')).toMatchObject({
    type: 'text',
    text: '登録が完了しました。「foo」さん、ありがとうございました。投稿されたおたよりの管理をすることができます。',
  })
})
