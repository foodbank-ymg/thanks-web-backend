import { db, newFirestore } from './firestore'

test('create and delete a document', async () => {
  newFirestore()
  const docRef = db.collection('test').doc('createFileTest')
  await docRef.set({ name: 'test' })
  const doc = (await docRef.get()).data()
  console.log(doc)
  expect(doc).toMatchObject({ name: 'test' })
  await docRef.delete()
})
