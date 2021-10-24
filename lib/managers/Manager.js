const Collection = require("../util/Collection");

/**
 * A basic manager for a bunch of objects.
 * @extends {Collection}
 */
class Manager extends Collection {
    constructor(client, iterable) {
        super(iterable);
    

        /**
         * The client that created this collection.
         * @type {Client}
         */
        this.client = client;
    }

    /**
     * A function to create an object based off the iterable.
     * @param {Object} options The options to send to the client.
     * @param {boolean} [cache=true] Whether or not to cache the created item, if any.
     * @returns {?Iterable}
     */
    async create(options, cache = true) {
        let data = await this.iterable._create(options, this.client).catch((err) => {
            return null;
        });

        if (cache == true) this.set(data.id, data);
        return data;
    }

    /**
     * A function to fetch, and cache an object.
     * @param {number|Object|Iterable} id The ID(s) of the object to fetch
     * @param {boolean} [cache=true] Whether or not to cache the returned item or not.
     * @returns {?Iterable}
     */
    async fetch(id, cache = true) {
        if (cache == true && !super.get(id.id || id)) {
            this.set(id.id || id, await this.iterable._fetch(id, this.client).catch((err) => {
                return null;
            }));
            return super.get(id.id || id);
        }

        return super.get(id.id || id);
    }
}

module.exports = Manager;