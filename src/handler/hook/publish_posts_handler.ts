import { Client } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { getJustPublishedPosts, updatePost } from '../../lib/firestore/post'
import { publishedPost } from './post'
import { loadConfig } from '../../config/config'
import moment from 'moment'

export class publishPostsHandler {
  constructor(private managerClient: Client, private recipientClient: Client) {}

  async handle(req: Request, res: Response) {
    let posts = await getJustPublishedPosts()
    if (posts.length === 0) {
      return res.status(200).json({
        status: 'new post not found',
      })
    }

    const conf = loadConfig()

    posts.forEach((post) => {
      this.recipientClient.pushMessage(
        post.recipientId,
        publishedPost(post.subject, `${conf.frontendUrl}/post/${post.id}`),
      )
      this.managerClient.pushMessage(
        post.approvedBy,
        publishedPost(post.subject, `${conf.frontendUrl}/post/${post.id}`),
      )
      post.publishedAt = moment().utcOffset(9).toDate()
      updatePost(post)
    })

    return res.status(200).json({
      status: 'success',
    })
  }
}
