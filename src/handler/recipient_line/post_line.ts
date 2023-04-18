import { Message } from '@line/bot-sdk'
import { Recipient } from '../../types/recipient'
import { Post } from '../../types/post'
import { postStatus, recipientStatus } from '../../consts/constants'
import { ConfirmTemplate, TextTemplate } from '../../lib/line/template'
import { addImageTransaction, deletePost, updatePost } from '../../lib/firestore/post'
import {
  askBody,
  askBodyAgain,
  askImage,
  askSubjectAgain,
  completePost,
  confirmBody,
  confirmImage,
  confirmPost,
  confirmSubject,
  discardPost,
} from './post'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { uploadResizedImage } from '../../lib/storage/post'
import { updateRecipient } from '../../lib/firestore/recipient'

const IMAGE_MAX = 3
const IMAGE_SIZE = 680

export const reactPostText = async (
  text: string,
  recipient: Recipient,
  post: Post,
): Promise<Message[]> => {
  switch (post.status) {
    case postStatus.INPUT_SUBJECT:
      post.subject = text
      post.status = postStatus.CONFIRM_SUBJECT
      await updatePost(post)
      return [confirmSubject(text)]
    case postStatus.CONFIRM_SUBJECT:
      switch (text) {
        case keyword.YES:
          post.status = postStatus.INPUT_BODY
          await updatePost(post)
          return [askBody()]
        case keyword.NO:
          post.status = postStatus.INPUT_SUBJECT
          post.subject = ''
          await updatePost(post)
          return [askSubjectAgain()]
        default:
          return [TextTemplate(phrase.yesOrNo)]
      }
    case postStatus.INPUT_BODY:
      post.body = text
      post.status = postStatus.CONFIRM_BODY
      await updatePost(post)
      return [confirmBody(text)]
    case postStatus.CONFIRM_BODY:
      switch (text) {
        case keyword.YES:
          post.status = postStatus.INPUT_IMAGE
          await updatePost(post)
          return [askImage()]
        case keyword.NO:
          post.status = postStatus.INPUT_BODY
          post.body = ''
          await updatePost(post)
          return [askBodyAgain()]
        default:
          return [TextTemplate(phrase.yesOrNo)]
      }
    case postStatus.INPUT_IMAGE:
      if (text === keyword.FINISH_IMAGE) {
        post.status = postStatus.CONFIRM_SUBMIT
        await updatePost(post)
        return [confirmPost()]
      }
    case postStatus.CONFIRM_SUBMIT: //TODO STILL CREATING
      switch (text) {
        case keyword.CONFIRM: //TODO ADD REVIEW FLOW
          recipient.status = recipientStatus.IDLE
          await updateRecipient(recipient)
          post.status = postStatus.WAITING_REVIEW
          await updatePost(post)
          return [completePost()]
        case keyword.DISCARD:
          recipient.status = recipientStatus.IDLE
          await updateRecipient(recipient)
          await deletePost(post)
          return [discardPost()]
        default:
          return [TextTemplate(phrase.aOrb(keyword.CONFIRM, keyword.DISCARD))]
      }
  }
}

export const reactPostImage = async (image: Buffer, post: Post): Promise<Message[]> => {
  switch (post.status) {
    case postStatus.INPUT_IMAGE:
      let path = await uploadResizedImage(image, IMAGE_SIZE, post)
      await addImageTransaction(post, path)
      if (post.images.length >= IMAGE_MAX) {
        post.status = postStatus.CONFIRM_SUBMIT
        await updatePost(post)
        return [confirmPost()]
      } else {
        return [confirmImage(post.images.length)]
      }
  }
}
