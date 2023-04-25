export type Config = {
  projectId: string
  managerLineSecret: string
  managerLineAccessToken: string
  recipientLineSecret: string
  recipientLineAccessToken: string
}

var config: Config | undefined

export const loadConfig = (): Config => {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    require('dotenv').config()
  }

  if (!config) {
    config = {
      projectId: process.env.PROJECT_ID,
      managerLineSecret: process.env.MANAGER_LINE_SECRET,
      managerLineAccessToken: process.env.MANAGER_LINE_TOKEN,
      recipientLineSecret: process.env.RECIPIENT_LINE_SECRET,
      recipientLineAccessToken: process.env.RECIPIENT_LINE_TOKEN,
    }
  }

  return config
}
