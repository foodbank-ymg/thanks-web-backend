import { Client, Message } from '@line/bot-sdk'

export const Push = async (client: Client, lineIds: string[], messages: Message[]) => {
  await Promise.all(lineIds.map((id) => client.pushMessage(id, messages)))
}
