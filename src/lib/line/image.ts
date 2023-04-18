import { Client } from '@line/bot-sdk'
import { client } from '../../handler/recipient_line/recipient_line'

//download image by event.message.id
export const downloadImageById = async (id: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    client.getMessageContent(id).then((stream) => {
      const content = []
      stream
        .on('data', (chunk) => {
          content.push(Buffer.from(chunk))
        })
        .on('error', reject)
        .on('end', () => {
          resolve(Buffer.concat(content))
        })
    })
  })
}
