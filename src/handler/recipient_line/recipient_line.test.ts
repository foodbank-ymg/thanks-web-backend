import { WebhookEvent } from '@line/bot-sdk'
import { recipientStatus, recipientStatusType } from '../../consts/constants'
import { getRecipientByLineId } from '../../lib/firestore/recipient'
import { Recipient } from '../../types/recipient'
import { handleEvent } from './recipient_line'

const getRecipient = (
  recipientGroupId: string,
  name: string,
  status: recipientStatusType,
): Recipient => {
  return {
    id: 'r-0001',
    recipientGroupId: recipientGroupId,
    lineId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb',
    name: name,
    status: status,
    enable: false,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

const getEvent = (type: string) => {
  return {
    type: type,
    source: { userId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb' },
  } as WebhookEvent
}

const getRecipient_ = jest.fn()

jest.mock('../../lib/firestore/recipient', () => ({
  updateRecipient: jest.fn(),
  getRecipientByLineId: () => getRecipient_(),
}))

describe('recipient_line/recipient_line', () => {
  const event = getEvent('follow')
  it('!name_!id', async () => {
    getRecipient_.mockImplementation(() => getRecipient('', '', recipientStatus.NONE))

    expect(await handleEvent(event)).toMatchObject([
      {
        type: 'text',
        text: '友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。',
      },
      { text: 'まず、お名前を教えてください。（サイトには公開されません）', type: 'text' },
    ])
  })

  it('name_!id', async () => {
    getRecipient_.mockReturnValue(getRecipient('', '太郎', recipientStatus.NONE))

    expect(await handleEvent(event)).toMatchObject([
      {
        type: 'text',
        text: '友だち追加ありがとうございます。\nこのアカウントでは、文章や画像をチャット送っていただくだけで記事投稿が出来ます。',
      },
      { text: 'フードバンク山口から払い出された団体IDを入力してください。', type: 'text' },
    ])
  })

  it('name_id', async () => {
    getRecipient_.mockReturnValue(getRecipient('rg-0001', '太郎', recipientStatus.NONE))

    expect(await handleEvent(event)).toMatchObject([
      {
        text: '「太郎」さん、おかえりなさい。',
        type: 'text',
      },
    ])
  })
})

//TODO check post sequence. Test code might be too long.