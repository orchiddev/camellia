const BaseClient = require("./BaseClient");
const WebSocketManager = require("./ws/WebSocketManager");
const Manager = require("../managers/Manager");
const Guild = require("../structures/Guild");
const Channel = require("../structures/Channel");
const User = require("../structures/User");

/**
 * The main client for using an application, or a token.
 * @extends {BaseClient}
 */
class Client extends BaseClient {
    /**
     * @param {ClientOptions} [options] Options for the client.
     */
    constructor(options = {}) {
        super(Object.assign({ _tokenHeader: "Bot" }, options));

        /**
         * The WS manager to this client.
         * @type {WebSocketManager}
         */
        this.ws = new WebSocketManager(this);

        /**
         * A cached collection of {@link User}'s
         * @type {Manager<User>}
         */
        this.users = new Manager(this, User);

        /**
         * A cached collection of {@link Guild}'s
         * @type {Manager<Guild>}
         */
        this.guilds = new Manager(this, Guild);

        /**
         * A cached collection of {@link Channel}'s
         * @type {Manager<Channel>}
         */
        this.channels = new Manager(this, Channel);
    }

    /** 
     * Connects to the gateway.
     * @returns {null}
     */
    async connect(token = process.env.DISCORD_TOKEN || this.token) {
        if (!token || !token instanceof String) throw new CamelliaError("TOKEN_MISSING");
        this.token = token.replace(/^(Bot|Bearer)\s*/i, '');

        try {
            await this.ws.connect();
            return null;
        } catch (error) {
            this.destroy();
            throw error;
        }
    }
}

module.exports = Client;