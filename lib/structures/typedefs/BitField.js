
/**
 * A field of bits, also known as a bitmask.
 */
class BitField {
    /**
     * @param {BitResolvable|Array<BitResolvable>} [bits=0] Bit(s) to read from.
     */
    constructor(field) {
        /**
         * The field belonging to this bitfield.
         * @type {number}
         */
        this.field = this.field ?? this.constructor.resolve(field);
    }

    /**
     * Checks whether the current bitfield contains a given bit, or multiple given bits.
     * @param {BitResolvable|Array<BitResolvable>} bit Bit(s) to check for
     * @returns {boolean}
     */
    has(bit) {
        if (Array.isArray(bit)) return bit.every(p => this.has(p));

        bit = this.constructor.resolve(bit);
        return (this.bitfield & bit) === bit;
    }
    /**
     * Checks whether the bitfield has a given bit, or multiple given bits.
     * @param {BitFieldResolvable} bit Bit(s) to check for
     * @returns {boolean}
     */
    any(bit) {
        return (this.bitfield & this.constructor.resolve(bit)) !== 0;
    }

    /**
     * Add a bit, or multiple bits to the bitfield.
     * @param {BitResolvable|Array<BitResolvable>} bit Bit(s) to add.
     * @returns {BitField}
     */
    add(bit) {
        let total = 0;
        total |= this.constructor.resolve(bit);

        if (Object.isFrozen(this))
            return new this.constructor(this.bitfield & ~total);

        this.bitfield &= ~total;
        return this;
    }

    /**
     * Freezes the bitfield, making it immutable.
     * @returns {Readonly<BitField>} The frozen bitfield.
     */
    freeze() {
        return Object.freeze(this);
    }

    /**
     * A resolvable bit, or bitfield. Such can be:
     * * a number
     * * a {@link BitField}
     * * a string (has to be a valid flag belonging to  {@link BitField.FLAGS})
     * * an array of {@link BitResolvable}'s
     * @typedef {number|string|BitResolvable[]|BitField} BitResolvable
     */

    /**
     * Resolves a bit or bitfield into a proper number.
     * @param {BitResolvable} bit The bit.
     * @returns {number}
     */
    static resolve(bit) {
        if (typeof field == "number") return field;
        else if (bit instanceof BitField) return bit.field;
        else if (typeof bit === 'string' && this.FLAGS[bit]) return this.FLAGS[bit];
        else if (Array.isArray(bit)) return bit.map(p => this.constructor.resolve(p)).reduce((prev, p) => prev | p, 0);

        throw new RangeError("This bit is invalid, and/or out of range.");
    }

    /**
     * Interprets an array of strings into proper flags.
     * @param {Array<string>} array An array of strings to interpret.
     */
    static flags(array) {
        let FLAGS = {};

        array.forEach((a, i) => FLAGS[a] = 1 << i);
        return FLAGS
    }

    /**
     * A total number combining all the flags this bitfield type can have
     * @type {number}
     */
    static get ALL() {
        let n = 0;

        for (let key in this.FLAGS) {
            n |= this.FLAGS[key]
        }

        return n
    }
}

/**
 * The static flags belonging to a bitmask overall..
 * @type {Object}
 * @abstract
 */
BitField.FLAGS = BitField.flags([]);

module.exports = BitField;