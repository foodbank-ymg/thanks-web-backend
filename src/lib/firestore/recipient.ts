import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { Recipient } from '../../types/recipient'

export const getRecipientById = async (id: string) => {
  const recipient = (
    await db.collection('recipients').doc(id).withConverter<Recipient>(recipientConverter).get()
  ).data()
  return recipient as Recipient | undefined
}

const recipientConverter = {
  toFirestore(recipient: Recipient): DocumentData {
    return {
      id: recipient.id,
      name: recipient.name,
      enable: recipient.enable,
      createdAt: recipient.createdAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Recipient {
    const data = snapshot.data()!
    return {
      id: data.id,
      name: data.name,
      enable: data.enable,
      createdAt: data.createdAt.toDate(),
    }
  },
}
