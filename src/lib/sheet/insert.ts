import { db, sheetId } from './sheet'

//insert data between row [row] and row [row+1]
export const insertRow = async (row: number, data: string[]) => {
  let values = data.map((v) => {
    return {
      userEnteredValue: {
        stringValue: v,
      },
    }
  })

  db.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: row,
              endIndex: row + 1,
            },
            inheritFromBefore: false,
          },
        },
        {
          updateCells: {
            range: {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 2,
              startColumnIndex: 0,
              endColumnIndex: data.length, //note that this is not the length of values
            },
            rows: [
              {
                values,
              },
            ],
            fields: 'userEnteredValue',
          },
        },
      ],
    },
  })
}
