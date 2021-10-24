const Util = require("../../util/Util");

// Discord epoch (2015-01-01T00:00:00.000Z)
const EPOCH = 1420070400000;

/**
 * A snowflake, or Twitter's ID system.
 */
class Snowflake {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated, as all the methods are static.`);
    }

    /**
     * A snowflake, or a machine-generated ID created by Twitter. A snowflake is constructed by a worker, using an timestamp in millisecond format since an epoch.
     * The epoch being the start date of all ID's, in Discord's case being `2015-01-01T00:00:00.000Z`.
     * 
     * A snowflake can be interpreted in a binary format, consisting of the ms since the epoch, the worker id, the process id, and an increment.
     * ```
     * 64                                          22     17     12          0
     *  000000111011000111100001101001000101000000  00001  00000  000000000000
     *       number of ms since Discord epoch       worker  pid    increment
     * ```
     * @see https://discord.com/developers/docs/reference#snowflakes
     * @typedef {string} Snowflake
     */

    /**
     * Deconstructs a snowflake from Discord.
     * @param {Snowflake} snowflake A snowflake.
     */
    static deconstruct(snowflake) {
        let binary = Util.binarify(snowflake).toString(2).padStart(64, "0");
        return {
          timestamp: parseInt(binary.substring(0, 42), 2) + EPOCH,
          workerID: parseInt(binary.substring(42, 47), 2),
          processID: parseInt(binary.substring(47, 52), 2),
          increment: parseInt(binary.substring(52, 64), 2),
          binary: binary,
        };
    }
}

module.exports = Snowflake;