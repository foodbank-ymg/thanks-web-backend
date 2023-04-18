import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { postStatus, recipientStatus } from '../../consts/constants'
import { makeId } from '../../utils/random/random'
import { Recipient } from '../../types/recipient'
import { Post } from '../../types/post'
import { bucket } from '../storage/storage'
import { deletePostData } from '../storage/post'

export const getWorkingPostByRecipientId = async (id: string) => {
  let post = undefined
  ;(
    await db
      .collection('posts')
      .where('recipientId', '==', id)
      .where('status', '!=', postStatus.WAITING_REVIEW)
      .withConverter<Post>(postConverter)
      .get()
  ).forEach((doc) => {
    post = doc.data()
  })
  return post as Post | undefined
}

export const getPostById = async (id: string) => {
  let post = undefined
  ;(
    await db.collection('posts').where('id', '==', id).withConverter<Post>(postConverter).get()
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
      createdAt: data.createdAt.toDate(),
      publishedAt: data.publishedAt ? data.publishedAt.toDate() : null,
    }
  },
}

//* should bind!!!!
export const createPost = async (recipient: Recipient) => {
  const newPost: Post = {
    id: `r-${makeId(4)}`,
    recipientGroupId: recipient.recipientGroupId,
    recipientId: recipient.id,
    status: postStatus.NONE,
    subject: '',
    body: '',
    images: [],
    feedback: '',
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
  deletePostData(post)
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
