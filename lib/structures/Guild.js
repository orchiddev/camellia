const Base = require("./Base");
const Endpoints = require("../rest/Endpoints");
const Manager = require("../managers/Manager");
const Member = require("./Member");

/**
 * A guild, or a server.
 * @extends {Base}
 */
class Guild extends Base {
    constructor(data, client) {
        super(client);

        /**
         * The ID of this guild
         * @type {Snowflake}
         */
        this.id = data.id;

        /**
         * Whether or not the guild is available to be accessed, or not.
         * @type {boolean}
         */
        this.available = !data.unavailable;

        if (!data) return;
        if (!this.available) {
            // TODO: i forgot what i was gonna do here
        } else {
            this._update(data);
        }
    }

    _update(data) {
        /**
         * The name of the guild.
         * @type {string}
         */
        this.name = data.name;

        /**
         * The icon hash of the guild.
         * @type {?string}
         */
        this.icon = data.icon ?? null;

        /**
         * The members of this guild.
         * @type {Manager<Member>}
         */
        this.members = new Manager(this.client, Member);
    }

    /**
     * The timestamp this guild was created at.
     * @type {number}
     */
    get created() {
        return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * @typedef {Object} GuildOptions
     * @property {string} name The name of the guild.
     */

    /**
     * The data to fetch over the HTTP server.
     * @param {GuildOptions} options The options to create this guild with.
     * @param {Client} client The client, to pull it's HTTP manager from.
     * @returns {boolean}
     * @private
     */
    static async _create(options, client) {
        await client.rest.request("POST", Endpoints.GUILDS(), { data: options, auth: true }).catch((err) => {
            return Promise.reject(err);
        });

        return true;
    }

    static async _fetch(id, client) {
        let data = new Guild(await client.rest.request("GET", Endpoints.GUILD(id), { auth: true }).catch((err) => {
            return Promise.reject(err);
        }), client)

        return Promise.resolve(data);
    }
}

module.exports = Guild;