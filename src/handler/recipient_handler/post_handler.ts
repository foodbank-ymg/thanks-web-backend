import { Client, Message } from '@line/bot-sdk'
import { Recipient } from '../../types/recipient'
import { Post } from '../../types/post'
import { postStatus, recipientStatus } from '../../consts/constants'
import { TextTemplate } from '../../lib/line/template'
import { deletePost, updatePost } from '../../lib/firestore/post'
import {
  askBody,
  askBodyAgain,
  askImage,
  confirmToApprovePost,
  askSubjectAgain,
  cannotPost,
  completePost,
  confirmBody,
  confirmImage,
  confirmPost,
  confirmSubject,
  discardPost,
  previewPost,
} from './post'
import { keyword } from '../../consts/keyword'
import { phrase } from '../../consts/phrase'
import { deletePostData, uploadImage } from '../../lib/storage/post'
import { updateRecipient } from '../../lib/firestore/recipient'
import sharp from 'sharp'
import { Push } from '../../lib/line/line'
import { getManagersByStationId } from '../../lib/firestore/manager'
import { action } from '../../consts/log'
import { getRecipientGroupById } from '../../lib/firestore/recipientGroup'
import { insertLog } from '../../lib/sheet/log'
import { postSummary, recipientSummary } from '../../lib/sheet/summary'

export const IMAGE_MAX = 1
const IMAGE_SIZE = 680

export const reactPostText = async (
  managerClient: Client,
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
        return [previewPost(post.subject, post.body, post.images), confirmPost()]
      }
      break
    case postStatus.CONFIRM_SUBMIT:
      switch (text) {
        case keyword.DECIDE:
          post.status = postStatus.WAITING_REVIEW

          await updatePost(post)
          await Push(
            managerClient,
            (await getManagersByStationId(recipient.stationId)).map((m) => m.lineId),
            [
              previewPost(post.subject, post.body, post.images),
              confirmToApprovePost(recipient.name, post.id),
            ],
          )
          const groupName = (await getRecipientGroupById(recipient.recipientGroupId)).name
          recipientSummary(recipient, groupName)
          insertLog(recipientSummary(recipient, groupName), action.SEND_POST, postSummary(post))
          return [completePost()]
        case keyword.DISCARD:
          recipient.status = recipientStatus.IDLE
          await updateRecipient(recipient)
          await deletePost(post)
          deletePostData(post).catch((err) => console.error(err))
          return [discardPost()]
        default:
          return [TextTemplate(phrase.aOrb(keyword.DECIDE, keyword.DISCARD))]
      }
    case postStatus.WAITING_REVIEW:
      return [cannotPost(post.subject)]
  }
}

export const reactPostImage = async (image: Buffer, post: Post): Promise<Message[]> => {
  switch (post.status) {
    case postStatus.INPUT_IMAGE:
      image = await sharp(image)
        .resize({ width: IMAGE_SIZE, height: IMAGE_SIZE, fit: sharp.fit.inside })
        .toBuffer()
      let path = await uploadImage(image, post)
      post.images.push(path)
      await updatePost(post)
      if (post.images.length >= IMAGE_MAX) {
        post.status = postStatus.CONFIRM_SUBMIT
        await updatePost(post)
        return [previewPost(post.subject, post.body, post.images), confirmPost()]
      } else {
        return [confirmImage(post.images.length)]
      }
  }
}
