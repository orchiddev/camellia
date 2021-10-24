const Guild = require("../../../structures/Guild");
const { Status, Events } = require("../../../util/Constants");

module.exports = async(client, d, shard) => {
    let guild = client.guilds.get(d.id);
    
    if (guild) {
        if (!guild.available && !d.unavailable) {
            guild._update(d);
        }
    } else {
        let guild = new Guild(d, client);
        /**
         * The shard this guild belongs to
         * @name Guild#shard
         * @type {WebSocketShard}
         */
        Object.defineProperty(guild, 'shard', { value: shard, enumerable: false });

        client.guilds.set(guild.id, guild);

        if (client.ws.status == Status.READY) {
            /**
             * Emitted whenever the client joins a guild.
             * @event Client#guildCreate
             * @param {Guild} guild The guild joined.
             */
            client.emit(Events.GUILD_CREATE, guild);
        }
    }
};