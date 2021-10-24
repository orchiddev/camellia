const Embed = require("../Embed");

/**
 * An embed field, as a class for easy management.
 * @see https://camellia.momiji.dev/#/docs/main/master/typedef/EmbedField
 * @private
 */
class EmbedField {
    constructor(data, value, inline) {
        if (data.constructor == Object) {
            this.name = data.name;
            this.value = data.value;
            this.inline = data.inline || false;
        } else if (data.constructor == String && value) {
            this.name = data;
            this.value = value;
            this.inline = inline || false;
        } else {
            if (data.constructor == String) throw new TypeError("Name/Data was a string, but value and inline wasn't provided.");
        }
    }
}

module.exports = EmbedField