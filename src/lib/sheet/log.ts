import moment from 'moment'
import { Post } from '../../types/post'
import { Recipient } from '../../types/recipient'
import { getRecipientGroupById } from '../firestore/recipientGroup'
import { insertRow } from './insert'

export const insertLog = async (user: string, action: string, target: string) => {
  // const resource = {
  //   values: [[new Date().toLocaleString(), user, action, target]],
  // }
  // db.spreadsheets.values.append({
  //   spreadsheetId: sheetId,
  //   range: 'シート1!A1',
  //   requestBody: resource,
  // })
  //to add first row
  insertRow(1, [moment().utcOffset(9).format('YYYY/M/DD h:mm:ss'), user, action, target])
}

export const recipientSummary = async (recipient: Recipient) => {
  const groupName = (await getRecipientGroupById(recipient.recipientGroupId)).name
  return `${groupName}_${recipient.name}`
}

export const postSummary = (post: Post) => {
  return `${post.id}_${post.subject}`
}
