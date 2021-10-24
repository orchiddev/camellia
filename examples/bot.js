const Camellia = require("camellia.js");

// a client constructor, to start off a bot
const bot = new Camellia.Client();

// the ready event, emitted whenever the bot starts up
bot.on("ready", () => {
    console.log("Bot ready!")
});

// the message event, sent everytime the bot recieves a message
bot.on("message", (msg) => {
    // check if the contents of the message start with the specific text, in our case; "!ping"
    if (msg.content === "!ping") {
        // a way to send a message to the channel the message was posted in
        msg.channel.send("Pong!");
    }
});

// you can input a token, or attach one to `process.env.DISCORD_TOKEN` using a .env file
// and wich such you can use "dotenv".
bot.connect("token"); 