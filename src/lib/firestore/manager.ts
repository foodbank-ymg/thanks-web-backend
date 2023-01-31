import { Manager } from '../../types/managers'
import { db } from './firestore'
import admin from 'firebase-admin'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { makeId } from '../../utils/random/random'

export const getManagerByLineId = async (lineId: string) => {
  const manager = (
    await db.collection('managers').doc(lineId).withConverter<Manager>(managerConverter).get()
  ).data()
  return manager as Manager | undefined
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
    status: '名前入力',
    enable: false,
    createdAt: new Date(),
  }
  updateManager(newManager)
  console.info(`create new user${newManager}`)
  return newManager
}
export const updateManager = async (manager: Manager) => {
  await db.collection('managers').doc(manager.lineId).set(manager)
}
