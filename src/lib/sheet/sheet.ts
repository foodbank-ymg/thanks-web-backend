import { google } from 'googleapis'
import { sheets_v4 } from 'googleapis/build/src/apis/sheets'
import { loadConfig } from '../../config/config'

export var db: sheets_v4.Sheets | undefined
export var sheetId: string | undefined

//https://hackernoon.com/how-to-use-google-sheets-api-with-nodejs-cz3v316f
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export const newSheet = async () => {
  if (db === undefined) {
    let conf = loadConfig()
    sheetId = conf.logSheetId
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
    })
    db = google.sheets({ version: 'v4', auth })
  }
}
