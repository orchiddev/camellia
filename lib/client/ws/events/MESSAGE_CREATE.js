const { Events } = require("../../../util/Constants");
const Message = require("../../../structures/Message");

module.exports = async (client, d) => {
    if (client.options.autoFilterBots == true && Boolean(data.bot) == true) return; // filter bots
    
    let channel = await client.channels.fetch(d.channel_id);
    d.channel_id = channel.id;

    // get author
    let author = d.webhook_id ? new Webhook(d.author) : await client.users.fetch(d.author.id);
    d.author.id = author.id;

    // get guild member
    if (d.guild_id && !d.webhook_id) {
        let guild = client.guilds.get(d.guild_id);
        let member = await guild.members.fetch({ guildID: guild.id, id: d.author.id });
        d.member = member;
    }

    // setup then await for setup
    let message = new Message(d, client);
    
    /**
     * Emitted when a message is sent to the client
     * @event Client#message
     * @param {Message} message The message sent to the client.
     */
    client.emit(Events.MESSAGE_CREATE, message);
};