import http from 'http'
import { loadConfig } from '../../config/config'

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

    const options = {
      hostname: `https://api.github.com`,
      path: `/repos/${this.username}/${this.repository}/actions/workflows/${yml}/dispatches`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        Authorization: `token ${this.token}`,
      },
    }

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}`))
        }
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(data)
      req.end()
    })
  }
}
