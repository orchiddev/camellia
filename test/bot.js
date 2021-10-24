require('dotenv').config();
const Camellia = require("../lib/index.js");
const Intents = require('../lib/structures/bitfields/Intents.js');

let bot = new Camellia.Client({
    intents: Intents.ALL
});

bot.on("ready", () => {
    console.log("Bot ready!")
});

bot.on("message", (msg) => {
    if (msg.content.startsWith("!eval ")) {
        let args = msg.content.substring(6, msg.content.length);
        if (args.length == 0) return;

        try {                                               // #   #  #####
            let evaw = eval(args);                          // #   #    #
            msg.channel.send(new Camellia.Embed({           // #####    #
                title: "Eval bad xd",                       // #   #    #
                description: `\`\`\`js\n${evaw}\n\`\`\``    // #   #  #####
            }));
        } catch (er) {
            msg.channel.send(new Camellia.Embed({
                title: "ur eval trash so it errord",
                description: `\`\`\`js\n${er}\n\`\`\``
            }));
        }
    } else if (msg.content == "!tmc") {
        msg.channel.send([
            "test",
            new Camellia.Embed({
                title: "Embed 1",
            }),
            new Camellia.Embed({
                title: "Embed 2",
            })
        ]);
    }
});

bot.connect();