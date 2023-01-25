import { ClientConfig } from "@line/bot-sdk";

type Config = {
  closedLine: ClientConfig;
  publicLine: ClientConfig;
};

export const loadConfig = (): Config => {
  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

  return {
    closedLine: {
      channelSecret: process.env.CLOSED_LINE_SECRET,
      channelAccessToken: process.env.CLOSED_LINE_TOKEN,
    },
    publicLine: {
      channelSecret: process.env.PUBLIC_LINE_SECRET,
      channelAccessToken: process.env.PUBLIC_LINE_TOKEN,
    },
  };
};
