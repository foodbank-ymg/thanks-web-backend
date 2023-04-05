import { WebhookEvent } from '@line/bot-sdk'
import { updateRecipient, getRecipientByLineId } from '../../lib/firestore/recipient'
import { Recipient } from '../../types/recipient'
import { handleEvent } from './recipient_line'
import { tellWelcome } from './setup'

jest.mock('../../lib/firestore/recipient', () => ({
  updateRecipient: jest.fn(),
  getRecipientByLineId: jest.fn(() => {
    return {
      id: 'r-0001',
      recipientGroupId: 'rg-0001',
      lineId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb',
      name: '',
      status: '初期状態',
      enable: false,
      createdAt: new Date('December 15, 1990 01:23:00'),
    } as Recipient
  }),
}))

test('line recipient_line/recipient_line message', async () => {
  const event = {
    type: 'follow',
    source: { userId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb' },
  } as any
  expect(await handleEvent(event)).toMatchObject([
    {
      type: 'text',
      text: '友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。',
    },
    { text: 'まず、お名前を教えてください。（サイトには公開されません）', type: 'text' },
  ])
})
