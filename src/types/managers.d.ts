import { firestore } from 'firebase-admin'
import { statusType } from '../consts/constants'

type Manager = {
  id: string
  lineId: string
  name: string
  status: statusType
  enable: boolean
  createdAt: Date
}
