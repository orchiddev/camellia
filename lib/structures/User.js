const Base = require("./Base");
const Endpoints = require("../rest/Endpoints");
const Snowflake = require("./typedefs/Snowflake");

/**
 * A generic user, as found on discord.
 * @extends {Base}
 */
class User extends Base {
    constructor(data, client) {
        super(client);

        /**
         * The ID of the user.
         * @type {Snowflake}
         */
        this.id = data.id;
    }

    _update(data) {
        /**
         * The username of the user.
         * @type {string}
         */
        this.username = data.username;

        /**
         * The discriminator of the user.
         * @type {number}
         */
        this.discriminator = data.discriminator;

        /**
         * The avatar hash of the user.
         * @type {string}
         */
        this.avatar_hash = data.avatar;

        /**
         * Whether or not this user is a bot, or not.
         * @type {boolean}
         */
        this.bot = Boolean(data.bot);
    }

    /**
     * The timestamp this user was created at.
     * @type {number}
     */
    get created() {
        return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * A link to the user's avatar.
     * @param {Object} [options={}] Options for the avatar  
     * @returns {?string}
     */
    avatar({ format, size, dynamic } = {}) {
        if (!this.avatar) return Endpoints.CDN(this.client.rest.cdn).DefaultAvatar(this.discriminator % 5);
        return Endpoints.CDN(this.client.rest.cdn).Avatar(this.id, this.avatar_hash, format, size, dynamic);
    }

    /**
     * Gets the user's tag.
     * @type {string}
     */
    get tag() {
        return `${this.username}#${this.discriminator}`;
    }

    static async _fetch(id, client) {
        let data = new User(await client.rest.request("GET", Endpoints.USER(id), { auth: true }).catch((err) => {
            return Promise.reject(err);
        }), client)

        return Promise.resolve(data);
    }
}

module.exports = User;