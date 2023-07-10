import http from 'http'
import { loadConfig } from '../../config/config'
var request = require('request')

export var gh: GithubClient | undefined

export const newGithub = () => {
  if (gh === undefined) {
    let conf = loadConfig()
    gh = new GithubClient(conf.githubUsername, conf.githubRepository, conf.githubToken)
  }
}

export const deploy = async () => {
  let conf = loadConfig()
  await gh.dispatchWorkflow(conf.githubYaml, conf.githubBranch)
}

export class GithubClient {
  private username: string
  private repository: string
  private token: string

  constructor(username: string, repository: string, token: string) {
    this.username = username
    this.repository = repository
    this.token = token
  }

  public dispatchWorkflow(yml: string, branch: string): Promise<void> {
    const data = JSON.stringify({
      ref: branch,
    })

    const conf = loadConfig()
    var options = {
      method: 'POST',
      url: `https://api.github.com/repos/${this.username}/${this.repository}/actions/workflows/${yml}/dispatches`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        Authorization: `token ${conf.githubToken}`,
        'Content-Length': data.length,
        'User-Agent':
          'githubapi',
      },
      body: data,
    }

    return new Promise((resolve, reject) => {
      request(options, function (error: Error, response: http.IncomingMessage) {
        if (error) reject(error)
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`Request failed with status code ${response.statusCode}`))
        }
      })
    })
  }
}
