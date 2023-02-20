import { confirmName, decideName, tellWelcomeBack } from './setup'

test('line setup message', async () => {
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
  expect(decideName('foo')).toMatchObject({ type: 'text', text: 'fooさん、よろしくお願いします。' })
})
