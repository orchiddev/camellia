const BaseClient = require("./BaseClient");
const { DefaultWebhookOptions } = require("../util/Constants");
const Webhook = require("../structures/Webhook");
const CamelliaError = require("../errors/CamelliaError");
const Util = require("../util/Util");

const WebhookRegex = /(?:(?:http(?:s)?):\/\/)?(?:(?:canary|ptb)\.)?discordapp\.com\/api\/webhooks\/([0-9]*)\/(.*)/g

/**
 * A client to access a webhook, and send data over it.
 * @extends {BaseClient}
 */
class WebhookClient extends BaseClient {
    /**
     * @param {string|Snowflake} id The ID of the webhook, or a URL belonging to one. The multiple object types exist because this class has more than one constructor.
     * @param {string|?WebhookClientOptions} token The token of the webhook, or options for a webhook. The multiple object types exist because this class has more than one constructor.
     * @param {?WebhookClientOptions} [options={}] The options to the embed, substituted for `token` if a URL is provided instead.
     */
    constructor(id, token, options = {}) {
        super({});
        if (!token || token.constructor == Object)
            return this._create(id, token);

        /**
         * The ID of the webhook this client utilizes.
         * @type {Snowflake}
         */
        this.id = this.id ?? id;

        /**
         * The token of the webhook this client utilizes.
         * @type {string}
         */
        this.token = this.token ?? token;

        // test for
        let webhook;
        Webhook._fetch({ id, token }, this).then((data) => {
            if (!data) throw new CamelliaError("WEBHOOK_INVALID");
            webhook = data;

            /**
             * The webhook bound to this client
             * @type {Webhook}
             */
            this.webhook = webhook;
        }).catch(err => { throw err; });
        
        /**
         * The options belonging uniquely to the webhook client.
         * @name WebhookClient#options
         * @type {WebhookClientOptions}
         */
        this.webhook_options = Util.mergeObjects(DefaultWebhookOptions, options || {});
    }

    /**
     * Sends a message to the webhook.
     * @param {MessageResolvable} content The message to send.
     * @param {boolean} [tts=false] Whether or not to sent the message as TTS, or not.
     */
    async send(content, tts = false) {
        if (!this.webhook) return null;
        return this.webhook.send(content, tts);
    }

    /**
     * Creates a webhook client based off a URL. Acts as a second constructor.
     * @private
     * @param {string} url A URL of a webhook.
     * @param {?options} options The options of the webhook.
     * @returns {null}
     */
    _create(url, options = {}) {
        let str = WebhookRegex.exec(url);
        if (str) {
            this.id = str[1];
            this.token = str[2];
            
            // test for
            let webhook;
            Webhook._fetch({ id: this.id, token: this.token }, this).then((data) => {
                if (!data) throw new CamelliaError("WEBHOOK_INVALID");
                webhook = data;
    
                /**
                 * The webhook bound to this client
                 * @type {Webhook}
                 */
                this.webhook = webhook;
            }).catch(err => { throw err; });
            
            this.webhook_options = Util.mergeObjects(DefaultWebhookOptions, options);

            if (this.webhook_options.enableReciever) {
                /**
                 * The reciever to HTTP requests.
                 * @private
                 * @type {WebhookReciever}
                 */
                this.reciever = new WebhookReciever(this);

                this.reciever.on("request", (data) => {
                    this.emit("message", data);
                })
            }
        }
    }
}

module.exports = WebhookClient;