type Config = {
  adminLineSecret: string;
  adminLineAccessToken: string;
  userLineSecret: string;
  userLineAccessToken: string;
};

var config: Config | undefined;

export const loadConfig = (): Config => {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  if (!config) {
    config = {
      adminLineSecret: process.env.CLOSED_LINE_SECRET,
      adminLineAccessToken: process.env.CLOSED_LINE_TOKEN,
      userLineSecret: process.env.PUBLIC_LINE_SECRET,
      userLineAccessToken: process.env.PUBLIC_LINE_TOKEN,
    };
  }

  return config;
};
