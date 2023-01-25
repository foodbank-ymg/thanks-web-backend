import { Client, Message, TextMessage, WebhookEvent } from "@line/bot-sdk";
import { Middleware } from "@line/bot-sdk/dist/middleware";
import { Express, Request, Response } from "express";

export const adminLineHandler = (
  app: Express,
  middleware: Middleware,
  client: Client
) => {
  app.post("/admin-line", middleware, (req, res) =>
    lineEvent(client, req, res)
  );
};

const lineEvent = async (client: Client, req: Request, res: Response) => {
  const events: WebhookEvent[] = req.body.events;
  Promise.all(events.map((event) => handleEvent(client, event))).then(
    (result) => res.json(result)
  );
};

export const handleEvent = async (client: Client, event: WebhookEvent) => {
  let res: TextMessage = { type: "text", text: "メッセージがありません。" };

  // switch (event.type) {
  //   case "unfollow":
  //     return;
  //   case "message":
  //     var user = await User.build(event.source.userId);
  //     res = await message(event, user);
  //     break;
  //   case "follow":
  //     var user = await User.build(event.source.userId);
  //     if (user.name === undefined || user.name === "") {
  //       res = {
  //         type: "text",
  //         text: "ご登録ありがとうございます。まずはお名前を教えてください。(Webサイトには表示されません)",
  //       }; //記事を投稿するときは「投稿」と話しかけてください
  //       user.setStatus(status.name, status.confirming);
  //     } else {
  //       res = {
  //         type: "text",
  //         text:
  //           user[field.name] +
  //           "さん、お帰りなさい！記事を投稿するときは「投稿」と話しかけてください",
  //       };
  //     }
  //     break;
  // }

  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, res);
};
