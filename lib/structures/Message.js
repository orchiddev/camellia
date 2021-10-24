const Base = require("./Base");
const Enum = require("./typedefs/Enum");
const Embed = require("./Embed");
const Snowflake = require("./typedefs/Snowflake");

const MessageTypes = new Enum([
    `DEFAULT`,
    `RECIPIENT_ADD`,
    `RECIPIENT_REMOVE`,
    `CALL`,
    `CHANNEL_NAME_CHANGE`,
    `CHANNEL_ICON_CHANGE`,
    `CHANNEL_PINNED_MESSAGE`,
    `GUILD_MEMBER_JOIN`,
    `USER_PREMIUM_GUILD_SUBSCRIPTION`,
    `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1`,
    `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2`,
    `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3`,
    `CHANNEL_FOLLOW_ADD`,
    `GUILD_DISCOVERY_DISQUALIFIED`,
    `GUILD_DISCOVERY_REQUALIFIED`
]);

/** 
 * A message sent from a discord user.
 * @extends {Base}
 */
class Message extends Base {
    constructor(data, client) {
        super(client);
        if (!data) return;

        /**
         * The ID of the message.
         * @type {Snowflake}
         */
        this.id = data.id;

        /**
         * The type of message.
         * @type {MessageType}
         */
        this.type = MessageTypes.get(data.type) ?? null;

        /**
         * The content of the message
         * @type {string}
         */
        this.content = data.content;

        // update data
        this._update(data);
    }

    _update(data) {
        /**
         * The author of this message.
         * @type {Webhook|User}
         */

        this.author = data.webhook_id ? new Webhook(data.author) : this.client.users.get(data.author.id);
        /**
         * The guild this message was sent in.
         * @type {?Guild}
         */
        this.guild = data.guild_id ? this.client.guilds.get(data.guild_id) : null;

        /**
         * The channel this message was sent in.
         * @type {TextChannel}
         */
        this.channel = this.client.channels.get(data.channel_id);

        /**
         * The guild member that sent this messsage.
         * @type {?Member}
         */
        this.member = data.member ? this.guild.members.get(data.author.id) : null;
    }

    /**
     * The timestamp this message was created at.
     * @type {number}
     */
    get created() {
        return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * A string or an object that can resolve as a proper message. This can be:
     * * a string
     * * an {@link Embed}
     * * an object
     *   * The contents of such can be:
     *   * `content.content` The content to send, or the message itself.
     *   * `content.tts` Whether or not the message should send as TTS or not.
     *   * `content.embed` An embed to send with the message.
     * * an array of {@link MessageResolvable}s.
     * @typedef {string|Embed|Object|Array<MessageResolvable>} MessageResolvable
     */

    /**
     * Formats a resolvable message to be sent out to discord.
     * @private
     * @param {string|Object|Array<string>} content The content to format.
     * @returns {MessageResolvable}
     */
    static format(content) {
        if (content.constructor == String) {
            // string
            if (content.length == 0) throw new CamelliaError("MESSAGE_EMPTY");
            return {
                content
            }
        } else if (content.constructor == Embed) {
            if (content.timestamp) content.timestamp = new Date(content.timestamp).toISOString();

            return {
                embeds: [content]
            };
        } else if (content.constructor == Object) {
            // object
            content = Util.mergeObjects({
                content: "",
                embeds: []
            }, content);
            if (content.content.length == 0 && content.embed == null) throw new CamelliaError("MESSAGE_EMPTY");

            return content;
        } else if (content.constructor == Array) {
            let obj = {};
            for (let piece of content) {
                let pieceObj = Message.format(piece)

                if (pieceObj.content) obj.content = pieceObj.content;
                if (pieceObj.embeds) {
                    if (obj.embeds) {
                        obj.embeds = [...obj.embeds, ...pieceObj.embeds];
                    } else {
                        obj.embeds = pieceObj.embeds;
                    }
                }

            }

            return obj;
        } else throw new CamelliaError("MESSAGE_INVALID");
    }
    
    /**
     * A string or an object that can resolve as a proper message for a webhook. This can be:
     * * a string
     * * an {@link Embed}
     * * an object
     *   * The contents of such can be:
     *   * `content.content` The content to send, or the message itself.
     *   * `content.tts` Whether or not the message should send as TTS or not.
     *   * `content.embed` An embed to send with the message.
     *   * `content.username` The username of the webhook to display.
     *   * `content.avatar_url` The avatar url to display for the webhook.
     * * an array of strings (of which will be joined with `\n`)
     * * an array of embeds (of which will be added to an array)
     * @typedef {string|Embed|Object|Array<string|Embed>} WebhookMessageResolvable
     */

    /**
     * Formats a resolvable message to be sent out to a webhook.
     * @private
     * @param {string|Object} content 
     * @returns {WebhookMessageResolvable}
     */
    static formatWebhook(content) {
        if (content.constructor == String) {
            // string
            if (content.length == 0) throw new CamelliaError("MESSAGE_EMPTY");
            return {
                content
            }
        } else if (content.constructor == Embed) {
            content.timestamp = new Date(content.timestamp).toISOString(); 
            return {
                embed: content
            };
        } else if (content.constructor == Object) {
            // object
            content = Util.mergeObjects({
                content: "",
                embed: null,
                username: undefined,
                avatar_url: undefined
            }, content);
            if (content.content.length == 0 && content.embed == null) throw new CamelliaError("MESSAGE_EMPTY");

            return content;
        } else if (content.constructor == Array) {
            let strs = [];
            let embeds = [];
            content.forEach((item) => {
                if (item.constructor == Embed) {
                    if (item.timestamp) item.timestamp = new Date(item.timestamp).toISOString(); 
                    embeds.push(item)
                } else strs.push(sts);
            })
            return {
                content: strs.join("\n"),
                embeds: embeds
            }
        } else throw new CamelliaError("MESSAGE_INVALID");
    }

    static async _fetch({ id, channel }, client) {
        return Promise.resolve(new Guild(await client.rest.request("GET", Endpoints.MESSAGE(channel.id || channel, id), { auth: true }).catch((err) => {
            return Promise.reject(err);
        })));
    }
}

/**
 * The types of messages available. A majority of these are system messages, but are still a message type nonetheless.
 * * `DEFAULT` - The basic message, as everyone would send.
 * * `RECIPIENT_ADD` - Sent whenever a new member gets added to a message group.
 * * `RECIPIENT_REMOVE` - Sent whenever a member gets removed from a message group.
 * * `CALL` - Sent whenever a call starts.
 * * `CHANNEL_NAME_CHANGE` - Sent whenever the name of a message group changes.
 * * `CHANNEL_ICON_CHANGE` - Sent whenever the icon of a message group changes.
 * * `CHANNEL_PINNED_MESSAGE` - Sent whenever a message gets pinned
 * * `GUILD_MEMBER_JOIN` - Sent whenever a member joins a server.
 * * `USER_PREMIUM_GUILD_SUBSCRIPTION` - Sent whenever a member boosts a server.
 * * `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1` - Sent whenever a member boosts a server, and it unlocks tier 1 as a result.
 * * `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2` - Sent whenever a member boosts a server, and it unlocks tier 2 as a result.
 * * `USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3` - Sent whenever a member boosts a server, and it unlocks tier 3 as a result.
 * * `CHANNEL_FOLLOW_ADD` - Sent whenever an news channel gets followed, and the channel the message gets sent is in redirects to it.
 * * `GUILD_DISCOVERY_DISQUALIFIED` - Sent whenever a server gets disqualified from server discovery.
 * * `GUILD_DISCOVERY_REQUALIFIED` - Sent whenever a server becomes qualified for server discovery.
 * @typedef {Enum} MessageType
 */
Message.TYPES = MessageTypes;

module.exports = Message;

// imports
const Webhook = require("./Webhook");
const TextChannel = require("./TextChannel");

