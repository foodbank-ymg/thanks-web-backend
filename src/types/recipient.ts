import { recipientStatusType } from '../consts/constants'

export type Recipient = {
  id: string
  stationId: string
  recipientGroupId: string
  lineId: string
  name: string
  status: recipientStatusType
  enable: boolean
  createdAt: Date
}
