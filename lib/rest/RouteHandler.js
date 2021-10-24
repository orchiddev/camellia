const CamelliaError = require("../errors/CamelliaError");
const Util = require("../util/Util");
const RequestError = require("../errors/RequestError");
const Collection = require("../util/Collection");
const HTTPRequest = require("./HTTPRequest");
const DiscordAPIError = require("../errors/DiscordAPIError");

/*
    DISCLAIMER:
    This code uses instances from the discord.js project (https://github.com/discordjs/discord.js), and gives
    all rights of the code used to the creators and maintainers of discord.js.
*/

function parseResponse(res) {
    if (res.headers.get("content-type").startsWith("application/json")) return res.json();
    return res.buffer();
}

function getAPIOffset(serverDate) {
    return new Date(serverDate).getTime() - Date.now();
}

function calculateReset(reset, serverDate) {
    return new Date(Number(reset) * 1000).getTime() - getAPIOffset(serverDate);
}

class RouteHandler {
    constructor(manager) {
        this.manager = manager;
        this.busy = false;
        this.queue = [];

        // ratelimit stuff
        this.reset = -1;
        this.remaining = -1;
        this.limit = -1;
        this.retry = -1;
    }

    push(request) {
        if (this.busy) {
            this.queue.push(request);
            return this.run();
        } else return this.execute(request);
    }

    run() {
        if (this.queue.length === 0) return Promise.resolve();
        return this.execute(this.queue.shift());
    }

    get _inactive() {
        return this.queue.length === 0 && !this.limited && !this.busy;
    }

    get ratelimited() {
        return Boolean(this.manager.globalTimeout) || (this.remaining <= 0 && Date.now() < this.reset);
    }

    async execute(req) {
        if (this.busy) {
            this.queue.unshift(req);
            return null;
        }

        this.busy = true;
        const { reject, request, resolve } = req;

        let res;
        try {
            res = await request.make();
        } catch (err) {
            this.busy = false;
            return reject(err);
        }

        // discord.js
        if (res && res.headers) {

            this.limit = res.headers.get("x-ratelimit-limit") ? Number(res.headers.get("x-ratelimit-limit")) : Infinity;
            this.remaining = res.headers.get("x-ratelimit-remaining") ? Number(res.headers.get("x-ratelimit-remaining")) : 1;
            this.reset = res.headers.get("x-ratelimit-reset") ? calculateReset(res.headers.get("x-ratelimit-reset"), res.headers.get('date')) : Date.now();
            this.retryAfter = res.headers.get("retry-after") ? Number(res.headers.get("retry-after")) : -1;

            // https://github.com/discordapp/discord-api-docs/issues/182
            if (request.path.includes("reactions")) {
                this.reset = new Date(serverDate).getTime() - getAPIOffset(serverDate) + 250;
            }

            // Handle ratelimit
            if (res.headers.get("x-ratelimit-global")) {
                this.manager.globalTimeout = Util.delay(this.retryAfter);
                await this.manager.globalTimeout;
                this.manager.globalTimeout = null;
            }
        }

        // request handler done
        this.busy = false;

        // This will be replaced later, I just needed a makeshift request maker.
        // Something is bound to break because of how much I copied.
        if (res.ok) {
            if (res.status == 204) return resolve();
            let data = await parseResponse(res)
            resolve(data);
            return this.exec();
        } else if (res.status === 429) {
            this.queue.unshift(req);
            await Util.delayFor(this.retryAfter);
            return this.exec();
        } else if (res.status >= 500 && res.status < 600) {
            // Retry the specified number of times for possible serverside issues
            if (req.retries === this.manager.client.options.requestLimit) {
                return reject(new Error("The limit of retries was reached."));
            } else {
                req.retries++;
                this.queue.unshift(req);
                return this.exec();
            }
        } else {
            // handle API errors
            try {
                let data = await parseResponse(res);
                if (res.status >= 400 && res.status < 500) {
                    return reject(new DiscordAPIError(data));
                }
                return null;
            } catch (err) {
                return reject(new RequestError(err.constructor.name, err.message, request.method, err.status, request.path));
            }
        }
    }
}

module.exports = RouteHandler;