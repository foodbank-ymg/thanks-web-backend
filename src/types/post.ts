import { postStatusType } from '../consts/constants'

export type Post = {
  id: string
  recipientGroupId: string
  recipientGroupName: string
  recipientId: string
  status: postStatusType
  subject: string
  body: string
  images: string[]
  feedback: string
  isRecipientWorking: boolean
  createdAt: Date
  publishedAt: Date
}
