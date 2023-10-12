import moment from 'moment'
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
