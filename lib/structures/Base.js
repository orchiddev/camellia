const Client = require("../client/Client");

/**
 * The basic data model that can be identified by an ID, or a snowflake.
 * @private
 */
class Base {
    constructor(client) {
        /**
         * The client that created this model.
         * @name Base#client
         * @type {Client}
         */
        Object.defineProperty(this, 'client', { value: client });
    }

    /**
     * Properly assign data to the structure.
     * @param {Object} data 
     * @private
     */
    _update(data) {
        return data;
    }

    /**
     * Creates an object based off data from posting to the API.
     * @param {Object} options The options to send over HTTP.
     * @param {Client} client The client, to pull it's HTTP manager from.
     * @returns {boolean}
     * @private
     */
    static async _create(options, client = null) {
        return true;
    }

    /**
     * The data to fetch over the HTTP server.
     * @param {Snowflake} id The ID to fetch by
     * @param {Client} client The client, to pull it's HTTP manager from.
     * @returns {*}
     * @private
     */
    static async _fetch(id, client) {
        return new this(client);
    }
}

module.exports = Base;