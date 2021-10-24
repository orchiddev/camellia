const CamelliaError = require("../errors/CamelliaError");
const { LIBRARY } = require("../errors/Messages");
const Util = require("../util/Util");
const DiscordAPIError = require("../errors/DiscordAPIError");
const EmbedField = require("./typedefs/EmbedField");

const CANNOT_BE_EMPTY = ["title", "description", "footer.text"];

/**
 * A structured representation of an embed inside of a message.
 */
class Embed {
    /**
     * @param {Object|Embed} data The object or embed to copy.
     * @param {?boolean} [skipValidation=true] Whether or not to validate the embed or not.
     */
    constructor(data, skipValidation = false) {
        if (!data) return;
        this.setup(data, skipValidation)
    }

    // DATA HANDLING FUNCTIONS

    // uwu

    // SETUP FUNCTIONS

    /**
     * Sets up the embed.
     * @private
     * @param {*} data The embed data.
     * @param {*} skipValidation Whether or not to skip the validation process, or not.
     */
    setup(data, skipValidation) {
        /**
         * The title of this embed
         * @type {?string}
         */
        this.title = data.title;

        /**
         * The type of this embed, either:
         * * `rich` - a rich embed
         * * `image` - an image embed
         * * `video` - a video embed
         * * `gifv` - a gifv embed
         * * `article` - an article embed
         * * `link` - a link embed
         * @type {string}
         */
        this.type = data.type;

        /**
         * The description of this embed
         * @type {?string}
         */
        this.description = data.description;

        /**
         * The url to this embed, clickable in the title.
         * @type {?string}
         */
        this.url = data.url;

        /**
         * The timestamp for this embed.
         * @type {?number}
         */
        this.timestamp = data.timestamp ? new Date(data.timestamp).getTime() : null;

        /**
         * The color of this embed.
         * @type {?ColorResolvable}
         */
        this.color = data.color ? Util.resolveColor(data.color) : null;

        /**
         * The footer of an embed.
         * @typedef {object} EmbedFooter
         * @property {string} text The text in the footer.
         * @property {?string} icon_url The icon of the footer, in `https://` url format.
         * @property {?string} proxy_icon_url A proxied url of the icon.
         */

        /**
         * The footer of this embed.
         * @type {?EmbedFooter}
         */
        this.footer = {
            text: data.footer?.text,
            icon_url: data.footer?.icon_url,
            proxy_icon_url: data.footer?.proxy_icon_url
        }

        /**
         * An image to display within an embed.
         * @typedef {Object} EmbedImage
         * @property {?string} url The url of the image, in `https://` url format.
         * @property {?string} proxy_url A proxied url of the image.
         * @property {?number} height The height of the image to display it at
         * @property {?number} width The width of the image to display it at
         */

        /**
         * The image of this embed.
         * @type {?EmbedImage}
         */
        this.image = {
            url: data.image?.url,
            proxy_url: data.image?.proxy_url,
            height: data.image?.height,
            width: data.image?.width
        }

        /**
         * A thumbnail to display within an embed.
         * @typedef {Object} EmbedThumbnail
         * @property {?string} url The url of the thumbnail, in `https://` url format.
         * @property {?string} proxy_url A proxied url of the thumbnail.
         * @property {?number} height The height of the thumbnail to display it at
         * @property {?number} width The width of the thumbnail to display it at
         */

        /**
         * The thumbnail of this embed.
         * @type {?EmbedThumbnail}
         */
        this.thumbnail = {
            url: data.thumbnail?.url,
            proxy_url: data.thumbnail?.proxy_url,
            height: data.thumbnail?.height,
            width: data.thumbnail?.width
        }

        /**
         * A video within an embed.
         * @typedef {Object} EmbedVideo
         * @property {?string} url The URL of the video.
         * @property {?number} height The height of the video to display it at
         * @property {?number} width The width of the video to display it at
         */

        /**
         * The video of this embed.
         * @type {?EmbedVideo}
         */
        this.video = {
            url: data.video?.url,
            height: data.video?.height,
            width: data.video?.width
        }

        /**
         * A provider that provided the data in the embed. Usually internal, and cannot be set by normal users.
         * @typedef {Object} EmbedProvider
         * @private 
         * @property {?string} name The name of the provider.
         * @property {?string} url The URL of the provider.
         */

        /**
         * The provider of this embed.
         * @private
         * @type {?EmbedProvider} 
         */
        this.provider = {
            name: data.provider?.name,
            url: data.provider?.url,
        }

        /**
         * The author of an embed.
         * @typedef {Object} EmbedAuthor
         * @property {?string} name The name of the author.
         * @property {?string} url The url of the author.
         * @property {?string} icon_url The avatar/icon of the author.
         * @property {?string} proxy_icon_url The proxied avatar/icon of the author.
         */

        /**
         * The author of this embed.
         * @type {?EmbedAuthor}
         */
        this.author = {
            name: data.author?.name,
            url: data.author?.url,
            icon_url: data.author?.icon_url,
            proxy_icon_url: data.author?.proxy_icon_url
        }

        /**
         * The fields of the embed.
         * @type {?EmbedField[]}
         */
        this.fields = data.fields ? Embed.normalizeFields(data.fields) : [];

        // validate embed
        if (!skipValidation) Embed.validate(this);
    }

    /**
     * The date attached to this timestamp.
     * @type {?Date}
     */
    get date() {
        return this.timestamp ? new Date(this.timestamp) : null;
    }

    /**
     * The hexadecimal color variant of the color in the embed.
     * @type {?string}
     */
    get hex() {
        return this.color ? `#${this.color.toString(16).padStart(6, '0')}` : null;
    }

    // Setup Functions
    /**
     * Sets a parameter of an embed, validating it right afterwards.
     * @private
     * @param {*} key The key of the embed to edit.
     * @param {*} data The data to set in the embed.
     * @returns {Embed}
     */
    set(key, data) {
        if (key.split(".")[1]) key = key.split(".");
        
        // setup test embed
        let testData = {};
        let key2 = null;
        if (key instanceof Array) {
            testData[key[0]] = {};
            testData[key[0]][key[1]] = data;
            key2 = key[1];
            key = key[0];

        } else testData[key] = data;
        let embed = new Embed(testData, true);

        if (!key2 && embed[key].constructor !== data.constructor) return;

        // specific types
        if (embed[key].constructor == Object) {
            if (key2) {
                this[key] = this[key] || {};
                this[key][key2] = data;
            } else this[key] = Util.mergeObjects(embed[key], data)
        } else if (this[key].constructor == Array) {
            data.forEach((d) => this[key].push(this[key]));
        } else this[key] = data;

        Embed.validate(this);
        return this;
    }

    /**
     * Adds data to an array in the embed.
     * @param {string} key 
     * @param {Array} data 
     * @returns {Embed}
     */
    add(key, data) {
        if (this[key] && !this[key] instanceof Array) return;
        let testData = {};
        let arr = [];
        if (this[key] && this[key] instanceof Array) arr = this[key];
        testData[key] = arr;
        data.forEach(d => testData[key].push(d));
        let embed = new Embed(testData, true);
        if (!embed[key] || !embed[key] instanceof Array) return;

        if (!this[key]) this[key] = data;
        else this[key] = arr;
        Embed.validate(this);
        return this;
    }

    // arbitrary functions

    /**
     * Properly validates an embed, and throws an error on invalid data.
     * @private
     * @param {Embed} embed The embed to verify.
     * @returns {boolean}
     */
    static validate(embed) {
        for (let key of Object.keys(embed)) {
            if (!embed[key] || embed[key] === undefined) return;

            // indexes cannot be empty
            if (CANNOT_BE_EMPTY.includes(key) && embed[key] == "") {
                let error = CamelliaError.throw("EMBED_INVALID", LIBRARY.EMBED_INVALID(key));;
                throw error;
            }

            if (embed[key].constructor == Object) {
                for (let key2 of Object.keys(embed[key])) {
                    if (CANNOT_BE_EMPTY.includes(`${key}.${key2}`) && embed[key][key2] == "") {
                        let error = CamelliaError.throw("EMBED_INVALID", LIBRARY.EMBED_INVALID(`${key}.${key2}`));;
                        throw error;
                    }
                }
            }

            switch (key) {
                case "fields":
                    if (!embed[key] instanceof Array) {
                        let error = CamelliaError.throw("EMBED_INVALID", LIBRARY.EMBED_INVALID(key));
                        throw error;
                    }

                    this.normalizeFields(embed[key]);
                    break;
                case "color":
                    embed[key] = Util.resolveColor(embed[key]);
                    break;
            }
        }

        return true;
    }

    /**
     * @typedef {object} EmbedField A field within an embed.
     * @property {string} name The name of this field
     * @property {string} value The value of this field
     * @property {boolean} [inline] Whether or not the field will be displayed inline or not.
     */

    /**
     * Normalizes a field, and throws a {@link CamelliaError} if a field is invalid.
     * @private
     * @param {*} name The name of the field.
     * @param {*} value The value of the field.
     * @param {*} [inline=false] Whether or not the field will be displayed inline or not.
     * @returns {EmbedField}
     */
    static normalizeField(name, value, inline = false) {
        if (!name || name == "") throw new CamelliaError("EMBED_FIELD_NAME");
        if (!value || name == "") throw new CamelliaError("EMBED_FIELD_VALUE");

        return new EmbedField({ name, value, inline });
    }

    /**
     * Normalizes an array of fields.
     * @private
     * @param {Array<EmbedField>} fields An array of fields.
     * @returns {Array<EmbedField>}
     */
    static normalizeFields(fields) {
        if (!fields) return null;
        return fields.map(field => this.normalizeField(field.name, field.value, typeof field.inline === 'boolean' ? field.inline : false))
    }
}

module.exports = Embed;