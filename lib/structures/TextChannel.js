const GuildChannel = require("./GuildChannel");
const CamelliaError = require("../errors/CamelliaError");
const Endpoints = require("../rest/Endpoints");
const Util = require("../util/Util");
const Message = require("./Message");

/**
 * A normal text channel, found in a {@link Guild}.
 * @extends {GuildChannel}
 */
class TextChannel extends GuildChannel {
    constructor(data, client) {
        super(data, client);
    }

    /**
     * The method to send a message to the desired guild channel.
     * @param {MessageResolvable} content The message itself
     * @param {boolean} [tts=false] Whether or not to sent the message as TTS, or not.
     * @returns {Message}
     */
    async send(content, tts = false) {
        content = Message.format(content);
        content.tts = tts;

        let message = await this.client.rest.request("POST", Endpoints.MESSAGES(this.id), {
            data: content,
            auth: true
        }).catch(err => { throw err; });

        return Promise.resolve(new Message(message, this.client));
    }
}

module.exports = TextChannel;