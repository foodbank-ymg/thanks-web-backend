import { statusType } from '../consts/constants'

type RecipientMember = {
  id: string
  recipientId: string
  lineId: string
  name: string
  status: statusType
  enable: boolean
  createdAt: Date
}
