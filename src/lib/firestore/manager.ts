import { Manager } from '../../types/managers'
import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { makeId } from '../../utils/random/random'
import { managerStatus } from '../../consts/constants'
import moment from 'moment'

export const getManagerByLineId = async (lineId: string) => {
  let manager = undefined
  ;(
    await db
      .collection('managers')
      .where('lineId', '==', lineId)
      .withConverter<Manager>(managerConverter)
      .get()
  ).forEach((doc) => {
    manager = doc.data()
  })
  return manager as Manager | undefined
}

export const getManagers = async () => {
  return (
    await db
      .collection('managers')
      .where('enable', '==', true)
      .withConverter<Manager>(managerConverter)
      .get()
  ).docs.map((doc) => doc.data())
}

const managerConverter = {
  toFirestore(manager: Manager): DocumentData {
    return {
      id: manager.id,
      lineId: manager.lineId,
      name: manager.name,
      status: manager.status,
      enable: manager.enable,
      createdAt: manager.createdAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Manager {
    const data = snapshot.data()!
    return {
      id: data.id,
      lineId: data.lineId,
      name: data.name,
      status: data.status,
      enable: data.enable,
      createdAt: data.createdAt.toDate(),
    }
  },
}

export const createManager = async (lineId: string) => {
  const newManager: Manager = {
    id: `m-${makeId(4)}`,
    lineId: lineId,
    name: '',
    status: managerStatus.INPUT_NAME,
    enable: false,
    createdAt: moment().utcOffset(9).toDate(),
  }
  updateManager(newManager)
  console.info(`create new manager${newManager}`)
  return newManager
}
export const updateManager = async (manager: Manager) => {
  await db.collection('managers').doc(manager.id).set(manager)
}
