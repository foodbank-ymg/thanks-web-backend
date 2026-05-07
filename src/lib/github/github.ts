import axios from 'axios'
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

  public async dispatchWorkflow(yml: string, branch: string): Promise<void> {
    const conf = loadConfig()
    const url = `https://api.github.com/repos/${this.username}/${this.repository}/actions/workflows/${yml}/dispatches`
    await axios.post(
      url,
      { ref: branch },
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${conf.githubToken}`,
          'User-Agent': 'githubapi',
        },
      },
    )
  }
}
