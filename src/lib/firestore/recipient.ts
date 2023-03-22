import { Recipient } from '../../types/recipient'
import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { status } from '../../consts/constants'
import { makeId } from '../../utils/random/random'

export const getRecipientByLineId = async (lineId: string) => {
  const recipient = (
    await db.collection('recipients').doc(lineId).withConverter<Recipient>(recipientConverter).get()
  ).data()
  return recipient as Recipient | undefined
}

const recipientConverter = {
  toFirestore(recipient: Recipient): DocumentData {
    return {
      id: recipient.id,
      recipientId: recipient.recipientId,
      lineId: recipient.lineId,
      name: recipient.name,
      status: recipient.status,
      enable: recipient.enable,
      createdAt: recipient.createdAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Recipient {
    const data = snapshot.data()!
    return {
      id: data.id,
      recipientId: data.recipientId,
      lineId: data.lineId,
      name: data.name,
      status: data.status,
      enable: data.enable,
      createdAt: data.createdAt.toDate(),
    }
  },
}

export const createRecipient = async (lineId: string) => {
  const newRecipient: Recipient = {
    id: `rm-${makeId(4)}`,
    recipientId: '',
    lineId: lineId,
    name: '',
    status: status.inputName,
    enable: false,
    createdAt: new Date(),
  }
  updateRecipient(newRecipient)
  console.info(`create new recipient${newRecipient}`)
  return newRecipient
}
export const updateRecipient = async (recipient: Recipient) => {
  await db.collection('recipients').doc(recipient.lineId).set(recipient)
}
