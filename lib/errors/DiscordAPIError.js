/**
 * Represents an error from the Discord Gateway.
 * @extends Error
 * @private
 */
class DiscordAPIError extends Error {
    constructor(data) {
        super(data.message);

        this.name = `DiscordAPIError [${data.code}]`;
        this.code = data.code;
        this.errors = data.errors || null;
        Error.captureStackTrace(this, DiscordAPIError);
    }
}

module.exports = DiscordAPIError;