import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { postStatus } from '../../consts/constants'
import { Recipient } from '../../types/recipient'
import { Post } from '../../types/post'
import moment from 'moment'

export const GetPostById = async (id: string) => {
  let post: Post = (
    await db.collection('posts').doc(id).withConverter<Post>(postConverter).get()
  ).data()
  return post
}

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

export const getWorkingPostByRejectedManagerId = async (id: string) => {
  let post = undefined
  ;(
    await db
      .collection('posts')
      .where('rejectedManagerId', '==', id)
      .where('isRecipientWorking', '==', false)
      .withConverter<Post>(postConverter)
      .get()
  ).forEach((doc) => {
    post = doc.data()
  })
  return post as Post | undefined
}

export const getJustPublishedPosts = async () => {
  let posts = (
    await db
      .collection('posts')
      .where('status', '==', postStatus.APPROVED)
      .where('publishedAt', '==', null)
      .withConverter<Post>(postConverter)
      .get()
  ).docs.map((doc) => doc.data())

  return posts
}

const postConverter = {
  toFirestore(post: Post): DocumentData {
    return {
      id: post.id,
      stationId: post.stationId,
      recipientGroupId: post.recipientGroupId,
      recipientGroupName: post.recipientGroupName,
      recipientId: post.recipientId,
      approvedManagerId: post.approvedManagerId,
      rejectedManagerId: post.rejectedManagerId,
      status: post.status,
      subject: post.subject,
      body: post.body,
      images: post.images,
      feedback: post.feedback,
      isRecipientWorking: post.isRecipientWorking,
      approvedBy: post.approvedBy,
      createdAt: post.createdAt,
      approvedAt: post.approvedAt,
      rejectedAt: post.rejectedAt,
      publishedAt: post.publishedAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Post {
    const data = snapshot.data()!
    return {
      id: data.id,
      stationId: data.stationId,
      recipientGroupId: data.recipientGroupId,
      recipientGroupName: data.recipientGroupName,
      recipientId: data.recipientId,
      approvedManagerId: data.approvedManagerId,
      rejectedManagerId: data.rejectedManagerId,
      status: data.status,
      subject: data.subject,
      body: data.body,
      images: data.images,
      feedback: data.feedback,
      isRecipientWorking: data.isRecipientWorking,
      approvedBy: data.approvedBy,
      createdAt: data.createdAt.toDate(),
      approvedAt: data.approvedAt ? data.approvedAt.toDate() : null,
      rejectedAt: data.rejectedAt ? data.rejectedAt.toDate() : null,
      publishedAt: data.publishedAt ? data.publishedAt.toDate() : null,
    }
  },
}

export const createPost = async (recipient: Recipient, groupName: string) => {
  const newPost: Post = {
    id: `${moment().utcOffset(9).format('YYMMDD-hhmmss')}`,
    stationId: recipient.stationId,
    recipientGroupId: recipient.recipientGroupId,
    recipientGroupName: groupName,
    recipientId: recipient.id,
    approvedManagerId: '',
    rejectedManagerId: '',
    status: postStatus.INPUT_IMAGE,
    subject: '',
    body: '',
    images: [],
    feedback: '',
    isRecipientWorking: true,
    approvedBy: '',
    createdAt: moment().utcOffset(9).toDate(),
    approvedAt: null,
    rejectedAt: null,
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
