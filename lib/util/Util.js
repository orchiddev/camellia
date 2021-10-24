/**
 * A utility class for all the utilities necessary for general purposes.
 */
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated, as all the methods are static.`);
    }

    /**
     * Function to merge two objects with eachother, and replace the values of the first with the second.
     * @param {Object} object The base object.
     * @param {Object} merge The object to merge with the base object.
     * @returns {Object} The combined objects.
     */
    static mergeObjects(object, merge) {
        let keys = Object.keys(object);

        keys.forEach((key) => {
            if ((object[key] instanceof Array) && merge[key])
                merge[key].forEach((data) => object[keys].push(data));

            if ((object[key] instanceof Object) && merge[key])
                object[key] = Util.mergeObjects(object[key], merge[key]);

            if (merge[key])
                object[key] = merge[key];
        });

        return object;
    }
    /**
     * Compares two objects, and the differences between them.
     * @param {Object} object The base object.
     * @param {Object} merge The object to compare between.
     * @returns {Array}
     */
    static compareObjects(object, comparison) {
        let keys = Object.keys(object);
        let diff = [];
        keys.forEach((key) => {

            if ((object[key] instanceof Object) && merge[key])
                diff.concat(Util.mergeObjects(object[key], merge[key]));

            if (object[key] !== merge[key])
                diff.push(key);
        });

        return diff;
    }

    /**
     * Mirrors an array into an object, with the value being the same as the keys.
     * @param {Array<string>} keys The keys to mirror and copy.
     */ 
    static mirror(keys) {
        let object = {}
        keys.forEach((key) => {
            object[key] = key;
        });

        return object;
    }

    /**
     * A color. Can be a number, a hex string, or an RGB array.
     * @typedef {string|number|number[]} ColorResolvable
     */

    /** 
     * Resolves a resolvable color into an actual color.
     * @param {ColorResolvable} color A color that can be resolved.
     * @returns {number}
     */
    static resolveColor(color) {
        if (typeof color === 'string') {
            color = Colors[color] || parseInt(color.replace('#', ''), 16);
        } else if (Array.isArray(color)) {
            color = (color[0] << 16) + (color[1] << 8) + color[2];
        }

        if (color < 0 || color > 0xffffff) throw new RangeError("The color must be within the range 0 - 16777215 (0xFFFFFF).");
        else if (color && isNaN(color)) throw new TypeError("Unable to convert the color into a number.");
        return color;
    }

    /**
     * Creates a Promise that resolves after a certain timeframe.
     * @param {number} ms How long to wait before resolving in milliseconds.
     * @returns {Promise<null>}
     */
    static delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Reads bytes at a specific amount from a given Buffer.
     * @param {Buffer} buffer The buffer to read from.
     * @param {number} first The fist index to start at.
     * @param {number} [last=buffer.length - 1] The last index to end with.
     * @returns {Array<number>}
     */
    static readBytes(buffer, first, last = buffer.length - 1) {
        // account for negatives
        if (first < 0) first = buffer.length + first
        if (last < 0) last = buffer.length + last;

        let array = [buffer[first]];
        for (let i = first; i <= last; i++) {
            array.push(buffer[i]);
        }

        return array;
    }

    /**
     * Changes a snowflake into a binary string.
     * @private
     * @param  {Snowflake} num A snowflake.
     * @returns {string}
     * @see https://github.com/discordjs/discord.js/blob/master/src/util/Util.js#L497
     */
    static binarify(num) {
        let bin = '';
        let high = parseInt(num.slice(0, -10)) || 0;
        let low = parseInt(num.slice(-10));
        while (low > 0 || high > 0) {
            bin = String(low & 1) + bin;
            low = Math.floor(low / 2);
            if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
            }
        }
        return bin;
    }

    /**
     * Compares an array of bytes with another.
     * @param {Array<number>} bytes The bytes to start with.
     * @param {Array<number>} compare The other bytes to compare against
     * @returns {boolean}
     */
    static compareBytes(bytes, compare) {
        return JSON.stringify(bytes) == JSON.stringify(compare);
    }
    
    /**
     * Checks if a string is valid JSON or not.
     * @param {string} json The string to parse.
     * @returns {boolean}
     */
    static isJSON(json) {
        try {
            JSON.parse(json);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = Util;

// imports
const { Colors } = require("./Constants");