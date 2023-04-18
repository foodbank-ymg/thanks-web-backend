import { postStatusType } from '../consts/constants'

export type Post = {
  id: string
  recipientGroupId: string
  recipientId: string
  status: postStatusType
  subject: string
  body: string
  images: string[]
  feedback: string
  createdAt: Date
  publishedAt: Date
}
