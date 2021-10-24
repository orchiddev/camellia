const CamelliaError = require("./CamelliaError");

/**
 * Represents an error from the WebSocket.
 * @extends CamelliaError
 * @private
 */
class WebSocketError extends CamelliaError {
    constructor(code) {
        super(code, "WS");
    }

    get name() {
        return `WebSocketError [${this.code}]`;
    }
}

module.exports = WebSocketError;