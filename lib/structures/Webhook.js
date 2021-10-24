const Base = require("./Base");
const Enum = require("./typedefs/Enum");
const Endpoints = require("../rest/Endpoints");
const Message = require("./Message");

const WebhookTypes = new Enum(["INCOMING", "CHANNEL_FOLLOWER"], { startFrom: 1 })

/**
 * A webhook, used to send data or messages to Discord without needing a bot account.
 * @extends {Base}
 */
class Webhook extends Base {
    constructor(data, client) {
        super(client);

        /**
         * The ID of the webhook.
         * @type {number}
         */
        this.id = data.id;

        /**
         * The type of webhook.
         * @type {WebhookType}
         */
        this.type = WebhookTypes.get(data.type) ?? null;

        /**
         * The token belonging to this webbook.
         * @type {?string}
         */
        this.token = data.token ?? null;

        if (data) this._update(data);
    }

    _update(data) {
    }

    /**
     * The method to send a message to this webhook.
     * @param {WebhookMessageResolvable} content The message itself.
     * @param {boolean} [tts=false] Whether or not to sent the message as TTS, or not.
     * @returns {Message}
     */
    async send(content, tts = false) {
        content = Message.formatWebhook(content);
        content.tts = tts;
        
        let message = await this.client.rest.request("POST", Endpoints.WEBHOOK(this.id, this.token), {
            data: content,
            auth: true
        }).catch(err => { throw err; });

        return Promise.resolve(new Message(message, this.client));
    }

    /**
     * The timestamp this webhook was created at.
     * @type {number}
     */
    get created() {
        return Snowflake.deconstruct(this.id).timestamp;
    }

    static async _fetch({ id, token }, client) {
        let data = new Webhook(await client.rest.request("GET", Endpoints.WEBHOOK(id, token)).catch((err) => {
            return Promise.reject(err);
        }), client);
        
        return Promise.resolve(data);
    }
}

/**
 * The types of webhooks available.
 * * `INCOMING: 1` - A webhook that posts messages to a channel with a token.
 * * `CHANNEL_FOLLOWER: 2` - An internal webhook that posts images from a channel that another channel is following.
 * @typedef {Enum} WebhookType
 */
Webhook.TYPES = WebhookTypes;

module.exports = Webhook;