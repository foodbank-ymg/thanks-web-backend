import { Client, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { Request, Response } from 'express';

export class recipientLineHandler {
  constructor(private client: Client) {}

  handle(req: Request, res: Response) {
    const events: WebhookEvent[] = req.body.events;
    Promise.all(events.map((event) => handleEvent(this.client, event))).then(
      (result) => res.json(result),
    );
  }
}

const handleEvent = async (client: Client, event: WebhookEvent) => {
  let res: TextMessage = { type: 'text', text: 'メッセージがありません。' };

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, res);
};
