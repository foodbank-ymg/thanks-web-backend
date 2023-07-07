import { postStatus, postStatusType, recipientStatus } from '../../consts/constants'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { newFirestore } from '../../lib/firestore/firestore'
import { TextTemplate } from '../../lib/line/template'
import { recipientSummary } from '../../lib/sheet/summary'
import { Post } from '../../types/post'
import { Recipient } from '../../types/recipient'
import { RecipientGroup } from '../../types/recipientGroup'
import {
  askBody,
  askImage,
  askSubjectAgain,
  completePost,
  confirmBody,
  confirmPost,
  confirmSubject,
  discardPost,
  previewPost,
} from './post'
import { reactPostText } from './post_handler'
import admin from 'firebase-admin'

const getPost = (status: postStatusType): Post => {
  return {
    id: 'rg-0001-230428-161200',
    stationId: 's-0001',
    recipientGroupId: 'rg-0001',
    recipientGroupName: 'recipientGroup',
    recipientId: 'r-0001',
    status: status,
    subject: '',
    body: '',
    images: [],
    feedback: '',
    isRecipientWorking: true,
    publishedAt: null,
    approvedAt: null,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

const getRecipient = (): Recipient => {
  return {
    id: 'r-0001',
    stationId: 's-0001',
    recipientGroupId: 'rg-0001',
    lineId: 'Uada2abc97aaaaae0a223eb4ddcbbbbbb',
    name: 'hope',
    status: recipientStatus.INPUT_POST,
    enable: false,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

const getRecipientGroup = (): RecipientGroup => {
  return {
    id: 'r-0001',
    stationId: 's-0001',
    name: 'recipientGroup',
    enable: true,
    createdAt: new Date('December 15, 1990 01:23:00'),
  }
}

jest.mock('../../lib/firestore/post', () => ({
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}))

jest.mock('../../lib/firestore/manager', () => ({
  getManagers: jest.fn(() => []),
}))

jest.mock('../../lib/line/line', () => ({
  Push: jest.fn(),
}))

jest.mock('../../lib/firestore/recipient', () => ({
  updateRecipient: jest.fn(),
}))

jest.mock('../../lib/sheet/log', () => ({
  insertLog: jest.fn(),
}))

const mockGetRecipientGroup = jest.fn()

jest.mock('../../lib/firestore/recipientGroup', () => ({
  getRecipientGroupById: () => mockGetRecipientGroup(),
}))

describe('recipient_handler/post_handler 記事投稿', () => {
  admin.initializeApp()
  newFirestore()
  const managerClient = undefined as any
  const recipient = getRecipient()
  mockGetRecipientGroup.mockReturnValue(getRecipientGroup())
  recipientSummary(recipient, 'test')

  it(':主題入力', async () => {
    const post = getPost(postStatus.INPUT_SUBJECT)
    expect(await reactPostText(managerClient, '主題', recipient, post)).toMatchObject([
      confirmSubject('主題'),
    ])
  })

  describe(':主題確認', () => {
    it(':YES', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText(managerClient, keyword.YES, recipient, post)).toMatchObject([
        askBody(),
      ])
    })
    it(':NO', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText(managerClient, keyword.NO, recipient, post)).toMatchObject([
        askSubjectAgain(),
      ])
    })
    it(':その他', async () => {
      const post = getPost(postStatus.CONFIRM_SUBJECT)
      expect(await reactPostText(managerClient, 'hoge', recipient, post)).toMatchObject([
        TextTemplate(phrase.yesOrNo),
      ])
    })
  })
  it(':本文入力', async () => {
    const post = getPost(postStatus.INPUT_BODY)
    expect(await reactPostText(managerClient, '本文', recipient, post)).toMatchObject([
      confirmBody('本文'),
    ])
  })
  it(':本文確認', async () => {
    const post = getPost(postStatus.CONFIRM_BODY)
    expect(await reactPostText(managerClient, keyword.YES, recipient, post)).toMatchObject([
      askImage(),
    ])
  })

  //* 画像入力はテストが難しい。
  it(':画像完了', async () => {
    const post = getPost(postStatus.INPUT_IMAGE)
    expect(await reactPostText(managerClient, keyword.FINISH_IMAGE, recipient, post)).toMatchObject(
      [previewPost(post.subject, post.body, post.images), confirmPost()],
    )
  })

  describe(':投稿確認', () => {
    it(':決定', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText(managerClient, keyword.DECIDE, recipient, post)).toMatchObject([
        completePost(),
      ])
    })
    it(':破棄', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText(managerClient, keyword.DISCARD, recipient, post)).toMatchObject([
        discardPost(),
      ])
    })
    it(':その他', async () => {
      const post = getPost(postStatus.CONFIRM_SUBMIT)
      expect(await reactPostText(managerClient, 'hoge', recipient, post)).toMatchObject([
        TextTemplate(phrase.aOrb(keyword.DECIDE, keyword.DISCARD)),
      ])
    })
  })
})
