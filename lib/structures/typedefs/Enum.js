const Util = require("../../util/Util");

/**
 * An enumeration, or a set of named constants with underlying integer types.
 * Types are accessed by keys, and are statically bound to numbers. 
 * @see https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum
 * @static
 */
class Enum {
    /**
     * @param {Object|Array<string>} data The data of keys to assign.
     * @param {?EnumOptions} options Enumerator options.
     */
    constructor(data, options = {}) {
        /**
         * The base data used for enumeration.
         * @type {Object|Array<*>}
         */
        this.data = data;

        /**
         * The options for an enumerator.
         * @private
         * @typedef {Object} EnumOptions
         * @property {number} [startfrom=0] The number to start from.
         * @property {number} [multiplier=1] The multiplier, for things like flags (2).
         */

        /**
         * The options for this enumerator.
         * @type {EnumOptions}
         */
        this.options = Util.mergeObjects({
            startFrom: 0,
            multiplier: 1
        }, options);

        this._construct(data);
        Object.freeze(this);
    }

    /**
     * Gets the value of a set constant.
     * @param {string|number} key The key, or Number to get by.
     */
    get(key) {
        if (!Object.entries(this).find(i => i[1] == parseInt(key)) && !this[key]) return null;
        return Object.entries(this).find(i => i[1] === parseInt(key))[1] || this[key];
    }

    /**
     * Gets a key of a value.
     * @param {string|number} key The key, or Number to get by.
     */
    key(key) {
        if (!Object.entries(this).find(i => i[1] == parseInt(key)) && !this[key]) return null;
        return Object.entries(this).find(i => i[1] === parseInt(key))[0] || key;
    }

    /**
     * Constructs the enumerator, and sets all the keys attached to it.
     * @private
     * @param {Object|Array<string>} data The data to enumerate by.
     */
    _construct(data) {
        if (data instanceof Array) {
            data.forEach((key, i) => this[key] = (i + this.options.startFrom) * this.options.multiplier);
        } else if (data.constructor == Object) {
            let keys = Object.keys(data);
            keys.forEach((key) => {
                if (!data[key] instanceof Number) throw new TypeError("An invalid type was used for enumeration.");
                this[key] = data[key]
            });
        } else throw new TypeError("An invalid type was used for enumeration.")
    }
}

module.exports = Enum;