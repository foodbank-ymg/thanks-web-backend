import { postStatusType } from '../consts/constants'

export type Post = {
  id: string
  stationId: string
  recipientGroupId: string
  recipientGroupName: string
  recipientId: string
  approvedManagerId: string
  rejectedManagerId: string
  status: postStatusType
  subject: string
  body: string
  images: string[]
  feedback: string
  isRecipientWorking: boolean
  createdAt: Date
  approvedAt: Date
  rejectedAt: Date
  publishedAt: Date
}
