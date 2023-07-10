export type Config = {
  projectId: string
  logSheetId: string
  managerLineSecret: string
  managerLineAccessToken: string
  recipientLineSecret: string
  recipientLineAccessToken: string
  githubUsername: string
  githubRepository: string
  githubYaml: string
  githubBranch: string
  githubToken: string
  jwtSecret: string
  frontendUrl: string
}

var config: Config | undefined

export const loadConfig = (): Config => {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    require('dotenv').config()
  }

  if (!config) {
    config = {
      projectId: process.env.PROJECT_ID,
      logSheetId: process.env.LOG_SHEET_ID,
      managerLineSecret: process.env.MANAGER_LINE_SECRET,
      managerLineAccessToken: process.env.MANAGER_LINE_TOKEN,
      recipientLineSecret: process.env.RECIPIENT_LINE_SECRET,
      recipientLineAccessToken: process.env.RECIPIENT_LINE_TOKEN,
      githubUsername: process.env.GITHUB_USERNAME,
      githubRepository: process.env.GITHUB_REPOSITORY,
      githubYaml: process.env.GITHUB_YAML,
      githubBranch: process.env.GITHUB_BRANCH,
      githubToken: process.env.GITHUB_TOKEN,
      jwtSecret: process.env.JWT_SECRET,
      frontendUrl: process.env.FRONTEND_URL,
    }
  }

  return config
}
