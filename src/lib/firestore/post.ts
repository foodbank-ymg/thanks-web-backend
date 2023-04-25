import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { postStatus, recipientStatus } from '../../consts/constants'
import { makeId } from '../../utils/random/random'
import { Recipient } from '../../types/recipient'
import { Post } from '../../types/post'
import { bucket } from '../storage/storage'
import { deletePostData } from '../storage/post'
import moment from 'moment'

export const getWorkingPostByRecipientId = async (id: string) => {
  let post = undefined
  ;(
    await db
      .collection('posts')
      .where('recipientId', '==', id)
      .where('isRecipientWorking', '==', true)
      .withConverter<Post>(postConverter)
      .get()
  ).forEach((doc) => {
    post = doc.data()
  })
  return post as Post | undefined
}

const postConverter = {
  toFirestore(post: Post): DocumentData {
    return {
      id: post.id,
      recipientGroupId: post.recipientGroupId,
      recipientId: post.recipientId,
      status: post.status,
      subject: post.subject,
      body: post.body,
      images: post.images,
      feedback: post.feedback,
      isRecipientWorking: post.isRecipientWorking,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Post {
    const data = snapshot.data()!
    return {
      id: data.id,
      recipientGroupId: data.recipientGroupId,
      recipientId: data.recipientId,
      status: data.status,
      subject: data.subject,
      body: data.body,
      images: data.images,
      feedback: data.feedback,
      isRecipientWorking: data.isRecipientWorking,
      createdAt: data.createdAt.toDate(),
      publishedAt: data.publishedAt ? data.publishedAt.toDate() : null,
    }
  },
}

export const createPost = async (recipient: Recipient) => {
  const newPost: Post = {
    id: `${recipient.recipientGroupId}-${moment().format('YYmmdd-HHMMSS')}`,
    recipientGroupId: recipient.recipientGroupId,
    recipientId: recipient.id,
    status: postStatus.INPUT_SUBJECT,
    subject: '',
    body: '',
    images: [],
    feedback: '',
    isRecipientWorking: true,
    createdAt: new Date(),
    publishedAt: null,
  }
  updatePost(newPost)
  console.info(`create new post${newPost}`)
  return newPost
}
export const updatePost = async (post: Post) => {
  await db.collection('posts').doc(post.id).set(post)
}

export const deletePost = async (post: Post) => {
  await db.collection('posts').doc(post.id).delete()
}

export const addImageTransaction = async (post_: Post, image: string) => {
  await db.runTransaction(async (transaction) => {
    const docRef = db.collection('posts').withConverter<Post>(postConverter).doc(post_.id)
    //const docSnap = await transaction.get(docRef)
    //const post = docSnap.data()
    post_.images.push(image)
    transaction.update(docRef, post_)
  })
}
