const Base = require("./Base");
const Enum = require("./typedefs/Enum");
const Endpoints = require("../rest/Endpoints");
const Snowflake = require("./typedefs/Snowflake");

const ChannelTypes = new Enum([
    "GUILD_TEXT", 
    "DM", 
    "GUILD_VOICE", 
    "GROUP_DM", 
    "GUILD_CATEGORY", 
    "GUILD_NEWS", 
    "GUILD_STORE"
]);

/**
 * A basic channel of any type.
 * @extends {Base}
 */
class Channel extends Base {
    constructor(data, client) {
        super(client);

        /**
         * The ID of the channel.
         * @type {Snowflake}
         */
        this.id = data.id;

        this._update(data);
    }

    _update(data) {
        /**
         * The name of the channel.
         * @type {string}
         */
        this.name = data.name;

        /**
         * The type of the channel.
         * @type {ChannelType}
         */
        this.type = ChannelTypes.get(data.type) ?? null;

        /**
         * Whether or not this channel is deleted.
         * @type {boolean}
         */
        this.deleted = false;
    }

    /**
     * The timestamp this channel was created at.
     * @type {number}
     */
    get created() {
        return Snowflake.deconstruct(this.id).timestamp;
    }

    static async _fetch(id, client) {
        let res = await client.rest.request("GET", Endpoints.CHANNEL(id), { auth: true }).catch((err) => {
            return Promise.reject(err);
        });

        switch (res.type) {
            // guild channels
            case ChannelTypes.GUILD_TEXT:
                return new TextChannel(res, client);
            case ChannelTypes.GUILD_CATEGORY:
                return new Category(res, client);
            default:
                return null;
        }
    }
}

/**
 * The available type of the channels.
 * * `GUILD_TEXT: 0` - a guild text channel
 * * `DM: 1` - a direct message channel
 * * `GUILD_VOICE: 2` - a guild voice channel
 * * `GROUP_DM: 3` - a group dm channel
 * * `GUILD_CATEGORY: 4` - a guild category channel
 * * `GUILD_NEWS: 5` - a guild news channel
 * * `GUILD_STORE: 6` - a guild store channel
 * @typedef {Enum} ChannelType
 */
Channel.TYPES = ChannelTypes;

module.exports = Channel;

// imports
const TextChannel = require("./TextChannel");
const Category = require("./Category");
