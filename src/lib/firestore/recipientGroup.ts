import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const getRecipientGroupById = async (id: string) => {
  const recipient = (
    await db
      .collection('recipients')
      .doc(id)
      .withConverter<RecipientGroup>(recipientConverter)
      .get()
  ).data()
  return recipient as RecipientGroup | undefined
}

const recipientConverter = {
  toFirestore(recipient: RecipientGroup): DocumentData {
    return {
      id: recipient.id,
      name: recipient.name,
      enable: recipient.enable,
      createdAt: recipient.createdAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): RecipientGroup {
    const data = snapshot.data()!
    return {
      id: data.id,
      name: data.name,
      enable: data.enable,
      createdAt: data.createdAt.toDate(),
    }
  },
}
