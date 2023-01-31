import { firestore } from 'firebase-admin'

type Manager = {
  id: string
  lineId: string
  name: string
  status: ManagerStatus
  enable: boolean
  createdAt: Date
}

type ManagerStatus = '名前入力' | ''
