import { WebhookEvent } from '@line/bot-sdk'
import { recipientStatus, recipientStatusType } from '../../consts/constants'
import { Recipient } from '../../types/recipient'
import { handleEvent } from './recipient_handler'

const getRecipient = (
  stationId: string,
  recipientGroupId: string,
  name: string,
  status: recipientStatusType,
): Recipient => {
  return {
    id: 'r0001',
    stationId: stationId,
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

const mockGetRecipient = jest.fn()

jest.mock('../../lib/firestore/recipient', () => ({
  updateRecipient: jest.fn(),
  getRecipientByLineId: () => mockGetRecipient(),
}))

describe('recipient_line/recipient_line フォロー', () => {
  const event = getEvent('follow')
  const managerClient = undefined as any
  const recipientClient = undefined as any
  it(':名前入力から再開', async () => {
    mockGetRecipient.mockImplementation(() => getRecipient('', '', '', recipientStatus.NONE))

    expect(await handleEvent(managerClient, recipientClient, event)).toMatchObject([
      {
        type: 'text',
        text: '友だち追加ありがとうございます。\nフードバンク山口「ありがとうWebサイト」のLINEアカウントです。フードバンク山口に食料を寄贈してくださる個人や企業、そして日々の運営を支えてくださるボランティアさんに感謝の気持ちをおたよりとして届けることができます。ぜひご活用ください。',
      },
      { text: 'まず、お名前を教えてください。（サイトには公開されません）', type: 'text' },
    ])
  })

  it(':団体ID入力から再開', async () => {
    mockGetRecipient.mockReturnValue(getRecipient('', '', '太郎', recipientStatus.NONE))

    expect(await handleEvent(managerClient, recipientClient, event)).toMatchObject([
      {
        type: 'text',
        text: '友だち追加ありがとうございます。\nフードバンク山口「ありがとうWebサイト」のLINEアカウントです。フードバンク山口に食料を寄贈してくださる個人や企業、そして日々の運営を支えてくださるボランティアさんに感謝の気持ちをおたよりとして届けることができます。ぜひご活用ください。',
      },
      { text: 'フードバンク山口から払い出された団体IDを入力してください。', type: 'text' },
    ])
  })

  it(':即復帰', async () => {
    mockGetRecipient.mockReturnValue(getRecipient('s0001', 'rg0001', '太郎', recipientStatus.NONE))

    expect(await handleEvent(managerClient, recipientClient, event)).toMatchObject([
      {
        text: '太郎さん、おかえりなさい。',
        type: 'text',
      },
    ])
  })
})

//TODO check post sequence. Test code might be too long.
