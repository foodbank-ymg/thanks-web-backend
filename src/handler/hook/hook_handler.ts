import { Client } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { Router } from 'express'
import { publishPostsHandler } from './publish_posts_handler'

export class hookHandler {
  constructor(private managerClient: Client, private recipientClient: Client) {}

  handle() {
    const hooks = Router()

    hooks.post('publish_posts', (req, res) =>
      new publishPostsHandler(this.managerClient, this.recipientClient).handle(req, res),
    )

    return hooks
  }
}
