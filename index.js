"use strict";

require("dotenv").config();

const ngrok = require("ngrok");
const express = require("express");
const line = require("@line/bot-sdk");

const { CHANNEL_SECRET, CHANNEL_TOKEN, NGROK_AUTH_TOKEN } = process.env;

const PORT = process.env.PORT || 3000;
const config = {
  channelSecret: CHANNEL_SECRET,
  channelAccessToken: CHANNEL_TOKEN,
};
const client = new line.Client(config);

async function handleLineWebHook(event) {
  let replyText = "";
  //  reply message
  if (event.message.type === "text") {
    const userMessage = event.message.text;

    if (userMessage === "Hello") {
      replyText = "こんにちは";
    }
    if (userMessage === "おはよう") {
      replyText = "Good morning";
    }
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: replyText,
  });
}

const app = express();

// middlewareを読み込む位置に注意が必要
// https://line.github.io/line-bot-sdk-nodejs/guide/webhook.html
app.use("/webhook", line.middleware(config));

app.post("/webhook", (req, res) => {
  if (req.body.events.length === 0) {
    res.sendStatus(200);

    return;
  }

  Promise.all(req.body.events.map(handleLineWebHook)).then((result) => {
    return res.json(result);
  });
});

app.listen(PORT);

(async () => {
  const url = await ngrok.connect({
    addr: PORT,
    authtoken: NGROK_AUTH_TOKEN,
  });

  console.log(`BOT_SERVER_URL: ${url}`);
})();
