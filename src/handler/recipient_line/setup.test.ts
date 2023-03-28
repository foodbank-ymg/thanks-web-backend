import { askRecipientId, askRecipientIdAgain } from './setup'

test('line recipient_line/setup message', async () => {
  expect(askRecipientId()).toMatchObject({
    type: 'text',
    text: 'フードバンク山口から払い出された団体IDを入力してください。',
  })
  expect(askRecipientIdAgain()).toMatchObject({
    type: 'text',
    text: '団体IDが見つかりません。もう一度入力をお願いします。',
  })
})
