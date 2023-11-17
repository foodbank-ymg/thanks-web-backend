import { Client } from '@line/bot-sdk'
import { Request, Response } from 'express'
import { getJustPublishedPosts, updatePost } from '../../lib/firestore/post'
import { publishedPost } from './post'
import { loadConfig } from '../../config/config'
import moment from 'moment'
import { GetRecipientById } from '../../lib/firestore/recipient'
import { GetManagerById, getManagerByLineId } from '../../lib/firestore/manager'
import axios from 'axios'

export class publishPostsHandler {
  constructor(private managerClient: Client, private recipientClient: Client) {}

  async handle(req: Request, res: Response) {
    const conf = loadConfig()

    let posts = await getJustPublishedPosts()
    let filteredPost = []
    await Promise.all(
      posts.map(async (post) => {
        let res
        try {
          res = await axios.get(`${conf.frontendUrl}/post/${post.id}`)
          if (res.status === 200) {
            filteredPost.push(post)
          }
        } catch (e) {}
      }),
    )
    if (posts.length === 0) {
      return res.status(200).json({
        status: 'new post not found',
      })
    }
    console.log(posts)

    posts.forEach(async (post) => {
      let recipientLine = (await GetRecipientById(post.recipientId)).lineId
      let managerLine = (await GetManagerById(post.approvedManagerId)).lineId
      const pageUrl = `${conf.frontendUrl}/post/${post.id}/?direct=1`
      this.recipientClient.pushMessage(recipientLine, [publishedPost(post.subject, pageUrl)])
      this.managerClient.pushMessage(managerLine, [publishedPost(post.subject, pageUrl)])
      post.publishedAt = moment().utcOffset(9).toDate()
      updatePost(post)
    })

    return res.status(200).json({
      status: 'success',
    })
  }
}
