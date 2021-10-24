const EventEmitter = require("events");
const Util = require("../util/Util");
const { DefaultClientOptions } = require("../util/Constants");
const RESTManager = require("../rest/RESTManager");

/**
 * The basic base to every client in the library.
 * @extends {EventEmitter}
 */
class BaseClient extends EventEmitter {
    constructor(options = {}) {
        super();

        /**
         * Active timeouts for the client created by {@link BaseClient#setTimeout}.
         * @type {Set<Timeout>}
         */
        this.timeouts = new Set();

        /**
         * Active intervals for the client created by {@link BaseClient#setInterval}.
         * @type {Set<Timeout>}
         */
        this.intervals = new Set();

        /**
         * Active immediates for the client created by {@link BaseClient#setImmediate}.
         * @type {Set<Immediate>}
         */
        this.immediates = new Set();

        /**
         * The options belonging to the client.
         * @type {ClientOptions}
         */
        this.options = Util.mergeObjects(DefaultClientOptions, options);

        /**
         * The HTTP manager for the client.
         * @type {RESTManager}
         * @private
         */
        this.rest = new RESTManager(this, this.options.tokenHeader);
    }

    /**
     * Destroys the client, clearing all the tiemouts and such.
     * @returns {null}
     */
    destroy() {
        // clear timeouts
        for (let timeout of this.timeouts) this.clearTimeout(timeout);
        for (let interval of this.intervals) this.clearInterval(interval);
        for (let immediate of this.immediates) this.clearImmediate(immediate);

        // empty sets
        this.timeouts.clear();
        this.intervals.clear();
        this.immediates.clear();
    }

    /**
     * Sets a timeout that will automatically end if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {number} delay Time to wait before running (in milliseconds)
     * @param {...*} args Arguments for the function
     * @returns {Timeout}
     */
    setTimeout(fn, delay, ...args) {
        let timeout = setTimeout(() => {
            fn(...args);
            this.timeouts.delete(timeout);
        }, delay);

        this.timeouts.add(timeout);
        return timeout;
    }

    /**
     * Clears a timeout.
     * @param {Timeout} timeout Timeout to cancel
     */
    clearTimeout(timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(timeout);
    }

    /**
     * Sets an interval that will automatically end if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {number} delay Time to wait before executing (in milliseconds)
     * @param {...*} args Arguments for the function
     * @returns {Timeout}
     */
    setInterval(fn, delay, ...args) {
        let interval = setInterval(() => {
            fn(...args);
            this.intervals.delete(interval);
        }, delay);

        this.intervals.add(interval);
        return interval;
    }

    /**
     * Clears an interval;
     * @param {Timeout} interval Interval to cancel
     */
    clearInterval(interval) {
        clearInterval(interval);
        this.intervals.delete(interval);
    }

    /**
     * Sets an immediate that will automatically end if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {...*} args Arguments for the function
     * @returns {Immediate}
     */
    setImmediate(fn, ...args) {
        const immediate = setImmediate(fn, ...args);
        this.immediates.add(immediate);
        return immediate;
    }

    /**
     * Clears an immediate.
     * @param {Immediate} immediate Immediate to cancel
     */
    clearImmediate(immediate) {
        clearImmediate(immediate);
        this.immediates.delete(immediate);
    }
}

module.exports = BaseClient;