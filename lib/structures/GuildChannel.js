const Channel = require("./Channel");
const Guild = require("./Guild");

/**
 * A chanmel in a guild.
 * @extends {Channel}
 */
class GuildChannel extends Channel {
    constructor(data, client) {
        super(data, client);

        /**
         * The guild this channel belongs to.
         * @type {Guild}
         */
        this.guild = this.client.guilds.get(data.guild_id);

        /**
         * 
         */
    }
}

module.exports = GuildChannel;