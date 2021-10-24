const CamelliaError = require("../errors/CamelliaError");
const Collection = require("../util/Collection");
const HTTPRequest = require("./HTTPRequest");
const RouteHandler = require("./RouteHandler");

/*
    DISCLAIMER:
    This code uses instances from the discord.js project (https://github.com/discordjs/discord.js), and gives
    all rights of the code used to the creators and maintainers of discord.js.
*/

class RESTManager {
    constructor(client, tokenHeader = "Bot") {
        this.client = client;
        this.tokenHeader = tokenHeader;

        this.handlers = new Collection();
    }

    auth() {
        if (!this.client.token) throw new CamelliaError("TOKEN_MISSING");
        return `${this.tokenHeader} ${this.client.token}`;
    }

    push(handler, request) {
        return new Promise((resolve, reject) => {
            handler.push({
                request,
                resolve,
                reject,
                retries: 0,
            }).catch(reject);
        });
    }

    request(method, path, options) {
        let request = new HTTPRequest(this, method, path, options);
        let handler = this.handlers.get(request.path);

        if (!handler) {
            handler = new RouteHandler(this);
            this.handlers.set(request.path, handler);
        }

        return this.push(handler, request);
    }
}

module.exports = RESTManager;