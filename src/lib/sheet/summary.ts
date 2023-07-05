import { Post } from '../../types/post'
import { Recipient } from '../../types/recipient'

export const recipientSummary = (recipient: Recipient, groupName: string) => {
  return `${groupName}_${recipient.name}`
}

export const postSummary = (post: Post) => {
  return `${post.id}_${post.subject}`
}
