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
    text: '友だち追加ありがとうございます。\nフードバンク山口「ありがとうWebサイト」のLINEアカウントです。フードバンク山口に食料を寄贈してくださる個人や企業、そして日々の運営を支えてくださるボランティアさんに感謝の気持ちをおたよりとして届けることができます。ぜひご活用ください。',
  })
  expect(askName()).toMatchObject({
    type: 'text',
    text: 'まず、お名前を教えてください。（サイトには公開されません）',
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
      text: 'お名前は「hoge」でよろしいですか？',
    },
  })
  expect(askNameAgain()).toMatchObject({
    type: 'text',
    text: 'もう一度お名前を教えてください。',
  })

  expect(completeRegister('foo')).toMatchObject({
    type: 'text',
    text: 'fooさんの登録が完了しました。ありがとうございました。\n「ねぇ」「こんにちは」などなんでも話しかけてください。おたよりの投稿を始めることができます。',
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
