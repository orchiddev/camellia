const Messages = require("./Messages");

/**
 * A generic error from the library.
 * @extends Error
 * @private
 */
class CamelliaError extends Error {
    constructor(code = "EMPTY", type = "LIBRARY") {
        super(Messages[type][code]);

        this.type = type;
        this.code = code;

        this.message = Messages[this.type][this.code];
        Error.captureStackTrace(this, CamelliaError);
    }

    get name() {
        return `CamelliaError [${this.code}]`;
    }

    /**
     * Returns a functional instance of the error.
     * @returns {CamelliaError}
     */
    static throw(code, message) {
        let error = new CamelliaError("EMPTY");

        error.code = code;
        error.message = message;
        Error.captureStackTrace(error, CamelliaError);
        return error;
    }
}

module.exports = CamelliaError;