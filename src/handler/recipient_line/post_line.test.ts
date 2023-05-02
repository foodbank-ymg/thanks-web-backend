import { postStatus, postStatusType, recipientStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { TextTemplate } from '../../lib/line/template'
import { Post } from '../../types/post'
import { Recipient } from '../../types/recipient'
import {
  askBody,
  askImage,
  askSubjectAgain,
  completePost,
  confirmBody,
  confirmPost,
  confirmSubject,
  discardPost,
} from './post'
import { reactPostText } from './post_line'

const getPost = (status: postStatusType): Post => {
  return {
    id: 'rg-0001-230428-161200',
    recipientGroupId: 'rg-0001',
    recipientId: 'r-0001',
    status: status,
    subject: '',
    body: '',
    images: [],
    feedback: '',
    isRecipientWorking: true,
    publishedAt: null,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

const getRecipient = (): Recipient => {
  return {
    id: 'r-0001',
    recipientGroupId: 'rg-0001',
    lineId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb',
    name: 'hope',
    status: recipientStatus.INPUT_POST,
    enable: false,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

jest.mock('../../lib/firestore/post', () => ({
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}))

jest.mock('../../lib/firestore/recipient', () => ({
  updateRecipient: jest.fn(),
}))

describe('recipient_line/post_line 記事投稿', () => {
  const recipient = getRecipient()
  it(':主題入力', async () => {
    const post = getPost(postStatus.INPUT_SUBJECT)
    expect(await reactPostText('主題', recipient, post)).toMatchObject([confirmSubject('主題')])
  })

  describe(':主題確認', () => {
    it(':YES', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText(keyword.YES, recipient, post)).toMatchObject([askBody()])
    })
    it(':NO', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText(keyword.NO, recipient, post)).toMatchObject([askSubjectAgain()])
    })
    it(':その他', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText('hoge', recipient, post)).toMatchObject([
        TextTemplate(phrase.yesOrNo),
      ])
    })
  })
  it(':本文入力', async () => {
    const post = getPost(postStatus.INPUT_BODY)
    expect(await reactPostText('本文', recipient, post)).toMatchObject([confirmBody('本文')])
  })
  it(':本文確認', async () => {
    const post = getPost(postStatus.CONFIRM_BODY)
    expect(await reactPostText(keyword.YES, recipient, post)).toMatchObject([askImage()])
  })

  //* 画像入力はテストが難しい。
  it(':画像完了', async () => {
    const post = getPost(postStatus.INPUT_IMAGE)
    expect(await reactPostText(keyword.FINISH_IMAGE, recipient, post)).toMatchObject([
      confirmPost(),
    ])
  })

  describe(':投稿確認', () => {
    it(':決定', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText(keyword.DECIDE, recipient, post)).toMatchObject([completePost()])
    })
    it(':破棄', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText(keyword.DISCARD, recipient, post)).toMatchObject([discardPost()])
    })
    it(':その他', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText('hoge', recipient, post)).toMatchObject([
        TextTemplate(phrase.aOrb(keyword.DECIDE, keyword.DISCARD)),
      ])
    })
  })
})
