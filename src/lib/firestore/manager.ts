import { Manager } from '../../types/managers'
import { db } from './firestore'
import admin from 'firebase-admin'
import { makeId } from '../../utils/random/random'

export const getManagerByLineId = async (lineId: string) => {
  const manager = (await db.collection('managers').doc(lineId).get()).data()
  if (manager === undefined) {
    const newManager: Manager = {
      id: `m-${makeId(4)}`,
      lineId: lineId,
      name: '',
      status: '名前入力',
      enable: false,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    }
    updateManager(newManager)
    console.info(`create new user${newManager}`)
    return newManager
  } else {
    return manager as Manager
  }
}

export const updateManager = (manager: Manager) => {
  db.collection('managers').doc(manager.lineId).set(manager)
}
