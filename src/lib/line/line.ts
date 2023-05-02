import { Client, Message } from '@line/bot-sdk'

export const Push = (client: Client, lineIds: string[], messages: Message[]) => {
  lineIds.map((id) => {
    client.pushMessage(id, messages)
  })
}
