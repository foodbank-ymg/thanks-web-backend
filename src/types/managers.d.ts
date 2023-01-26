import { firestore } from 'firebase-admin'

type Manager = {
  id: string
  lineId: string
  name: string
  status: ManagerStatus
  enable: boolean
  createdAt: firestore.Timestamp
}

type ManagerStatus = '名前入力' | '待機'
