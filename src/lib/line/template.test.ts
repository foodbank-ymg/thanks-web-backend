import { keyword } from '../../consts/keyword'
import { ConfirmTemplate, QuickReplyTemplate, TextTemplate } from './template'

describe(`line line/template `, () => {
  it(':TextTemplate', () => {
    expect(TextTemplate('テキストテンプレート')).toMatchObject({
      type: 'text',
      text: 'テキストテンプレート',
    })
  })

  describe(':ConfirmTemplate', () => {
    it(':YES NO', () => {
      expect(ConfirmTemplate('確認ダイアログテスト', '確認テスト')).toMatchObject({
        type: `template`,
        altText: `確認テスト`,
        template: {
          type: `confirm`,
          actions: [
            { type: `message`, label: keyword.YES, text: keyword.YES },
            { type: `message`, label: keyword.NO, text: keyword.NO },
          ],
          text: `確認ダイアログテスト`,
        },
      })
    })
    it(':Custom option', () => {
      expect(
        ConfirmTemplate('確認ダイアログテスト任意選択肢', '確認テスト', [
          keyword.DECIDE,
          keyword.DISCARD,
        ]),
      ).toMatchObject({
        type: `template`,
        altText: `確認テスト`,
        template: {
          type: `confirm`,
          actions: [
            { type: `message`, label: keyword.DECIDE, text: keyword.DECIDE },
            { type: `message`, label: keyword.DISCARD, text: keyword.DISCARD },
          ],
          text: `確認ダイアログテスト任意選択肢`,
        },
      })
    })
  })

  it(':QuickReplyTemplate', () => {
    expect(QuickReplyTemplate('クイックリプライ', ['A', 'B'])).toMatchObject({
      type: 'text',
      text: 'クイックリプライ',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: 'A',
              text: 'A',
            },
          },
          {
            type: 'action', //
            action: {
              type: 'message',
              label: 'B',
              text: 'B',
            },
          },
        ],
      },
    })
  })
})
