import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { status } from '../../consts/constants'
import { makeId } from '../../utils/random/random'
import { RecipientMember } from '../../types/recipientMember'

export const getRecipientByLineId = async (lineId: string) => {
  let recipient = undefined
  ;(
    await db
      .collection('recipientMembers')
      .where('lineId', '==', lineId)
      .withConverter<RecipientMember>(recipientMemberConverter)
      .get()
  ).forEach((doc) => {
    recipient = doc.data()
  })
  return recipient as RecipientMember | undefined
}

const recipientMemberConverter = {
  toFirestore(recipient: RecipientMember): DocumentData {
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
  fromFirestore(snapshot: QueryDocumentSnapshot): RecipientMember {
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

export const createRecipientMember = async (lineId: string) => {
  const newRecipient: RecipientMember = {
    id: `rm-${makeId(4)}`,
    recipientId: '',
    lineId: lineId,
    name: '',
    status: status.inputName,
    enable: false,
    createdAt: new Date(),
  }
  updateRecipientMember(newRecipient)
  console.info(`create new recipientMember${newRecipient}`)
  return newRecipient
}
export const updateRecipientMember = async (recipient: RecipientMember) => {
  await db.collection('recipientMembers').doc(recipient.id).set(recipient)
}
