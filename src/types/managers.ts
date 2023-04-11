import { managerStatusType } from '../consts/constants'

export type Manager = {
  id: string
  lineId: string
  name: string
  status: managerStatusType
  enable: boolean
  createdAt: Date
}
