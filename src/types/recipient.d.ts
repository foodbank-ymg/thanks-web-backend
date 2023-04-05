import { recipientStatusType } from '../consts/constants'

type Recipient = {
  id: string
  recipientGroupId: string
  lineId: string
  name: string
  status: recipientStatusType
  enable: boolean
  createdAt: Date
}
