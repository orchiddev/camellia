require('dotenv').config();
const Camellia = require("../lib/index.js");

const wh = new Camellia.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);
const wh2 = new Camellia.WebhookClient(process.env.WEBHOOK_URL, {
    enableReciever: true
});

wh2.on("message", (data) => {
    console.log("Data recieved!")
    wh2.send(data.message)
})