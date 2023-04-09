import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { RecipientGroup } from '../../types/recipientGroup'

export const getRecipientGroupById = async (id: string) => {
  const recipient = (
    await db
      .collection('recipientGroups')
      .doc(id)
      .withConverter<RecipientGroup>(recipientGroupConverter)
      .get()
  ).data()
  return recipient as RecipientGroup | undefined
}

const recipientGroupConverter = {
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
