const Package = require("../../package.json");
const Util = require("./Util");
exports.Package = Package;

/**
 * All of the default bot client options.
 * @typedef {Object} ClientOptions
 * @property {string|number} [shards=auto] How many shards that should be spawned.
 * @property {boolean} [disableEveryone=true] Whether to filter out everyone & here mentions or not.
 * @property {boolean} [emitRawData=false] Whether or not to emit raw gateway data to the client, through the `data` event.
 * @property {number} [intents=0] The specified intents to send to the gateway.
 * @property {WebSocketOptions} [ws] Options to send to the WebSocket on connection.
 * @property {RestOptions} [rest] Options for the HTTP side of things.
 */
exports.DefaultClientOptions = {
    // Hidden Options
    _tokenHeader: "Bot",

    // TODO: Add more options.
    shards: "auto",
    disableEveryone: true,
    autoFilterBots: false,
    emitRawData: false,

    requestLimit: 5,
    requestTimeout: 15000,

    intents: 0,

    /**
     * Options to send to the WebSocket on connection.
     * @typedef {Object} WebSocketOptions
     * @property {number} [version=6] The version of the gateway to connect to.
     * @property {number} [large_threshold=250] The amount of offline members to be recieved.
     */
    ws: {
        version: 9,
        compress: false,
        properties: {
            "$os": process.platform,
            "$browser": "camellia",
            "$device": "camellia"
        },
        large_threshold: 250
    },

    /**
     * Options for the HTTP side of things.
     * @typedef {Object} RestOptions
     * @property {number} [version=7] The version of the API to connect to.
     * @property {string} [api=https://discord.com/api] The url of the HTTP API.
     * @property {string} [cdn=https://cdn.discordapp.com/] The url to the Discord CDN.
     * @property {string} [invite=https://discord.gg] The url for all invites.
     */
    rest: {
        version: 9,
        api: "https://discord.com/api",
        cdn: "https://cdn.discordapp.com",
        invite: "https://discord.gg"
    }
}

/**
 * All of the default {@link WebhookClient} options.
 * @typedef {Object} WebhookClientOptions
 */
exports.DefaultWebhookOptions = {
}

// UserAgent
exports.UserAgent = `Camellia (${Package.homepage.split("#")[0]} node.js/${Package.version})`;

exports.OP_CODES = {
    DISPATCH: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    STATUS_UPDATE: 3,
    VOICE_STATE_UPDATE: 4,
    VOICE_GUILD_PING: 5,
    RESUME: 6,
    RECONNECT: 7,
    REQUEST_GUILD_MEMBERS: 8,
    INVALID_SESSION: 9,
    HELLO: 10,
    HEARTBEAT_ACK: 11,
};

exports.ShardEvents = {
    CLOSE: "close",
    READY: "ready",
    MESSAGE: "message",

    // Debug Events
    DESTROYED: "destroyed",
    ALL_READY: "allReady",
    RESUMED: "resumed",
    INVALID_SESSION: "invalidSession",
    // Error Events
    ERROR: "error"
}

exports.Events = {
    // Primary Events
    READY: "ready",
    GUILD_CREATE: "guildCreate",
    MESSAGE_CREATE: "message",

    // Debugging Events
    DATA: "data",
    DEBUG: "debug",
    RATELIMIT: "ratelimit",
    INVALIDATED: "invalidated",

    // Error Events
    ERROR: "error",
    SHARD_READY: "shardReady",
    SHARD_DEAD: "shardDead",
    SHARD_RECONNECT: "shardReconnect",
    SHARDING_ERROR: "shardError"
}

exports.WSEvents = Util.mirror([
    "READY",
    "RESUMED",
    "GUILD_CREATE"
]);

/**
 * The status of the client, or it's websocket manager.
 * Available status are as of provided:
 * * READY: 0
 * * IDLE: 1
 * * CONNECTING: 2
 * * RECONNECTING: 3
 * * AWAITING_GUILDS: 4
 * * IDENTIFYING: 5
 * @typedef {number} Status
 */

exports.Status = {
    READY: 0,
    IDLE: 1,
    RESUMING: 2,
    DISCONNECTED: 3,
    CONNECTING: 4,
    RECONNECTING: 5,
    AWAITING_GUILDS: 6,
    IDENTIFYING: 7,
}

/**
 * All of the colors provided by Discord.
 * @typedef {Colors}
 */
exports.Colors = {
    DEFAULT: 0x000000,
    WHITE: 0xffffff,
    AQUA: 0x1abc9c,
    GREEN: 0x2ecc71,
    BLUE: 0x3498db,
    YELLOW: 0xffff00,
    PURPLE: 0x9b59b6,
    LUMINOUS_VIVID_PINK: 0xe91e63,
    GOLD: 0xf1c40f,
    ORANGE: 0xe67e22,
    RED: 0xe74c3c,
    GREY: 0x95a5a6,
    NAVY: 0x34495e,
    DARK_AQUA: 0x11806a,
    DARK_GREEN: 0x1f8b4c,
    DARK_BLUE: 0x206694,
    DARK_PURPLE: 0x71368a,
    DARK_VIVID_PINK: 0xad1457,
    DARK_GOLD: 0xc27c0e,
    DARK_ORANGE: 0xa84300,
    DARK_RED: 0x992d22,
    DARK_GREY: 0x979c9f,
    DARKER_GREY: 0x7f8c8d,
    LIGHT_GREY: 0xbcc0c0,
    DARK_NAVY: 0x2c3e50,
    BLURPLE: 0x7289da,
    GREYPLE: 0x99aab5,
    DARK_BUT_NOT_BLACK: 0x2c2f33,
    NOT_QUITE_BLACK: 0x23272a,
};