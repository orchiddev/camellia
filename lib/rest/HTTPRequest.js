const https = require('https');
const { UserAgent } = require("../util/Constants");
const { URLSearchParams } = require('url');
const fetch = require("node-fetch");
const { AbortController } = require("@camelliajs/abort-controller");
if (https.Agent) var agent = new https.Agent({ keepAlive: true });
/*
    DISCLAIMER:
    This code largely uses instances from the discord.js project (https://github.com/discordjs/discord.js), and gives
    all rights of the code used to the creators and maintainers of discord.js. 
*/

class HTTPRequest {
    constructor(manager, method, path, options = {}) {
        this.manager = manager;
        this.client = manager.client;

        this.method = method;
        this.options = options;

        let queryString = "";
        if (options.query) {
            let query = Object.entries(options.query)
                .filter(([, value]) => ![null, "null", "undefined"].includes(value) && typeof value !== "undefined")
                .flatMap(([key, value]) => (Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]));
            queryString = new URLSearchParams(query).toString();
        }

        this.base = path;
        this.path = `${path}${queryString && `?${queryString}`}`;
    }

    make() {
        let apiUrl = `${this.client.options.rest.api}/v${this.client.options.rest.version}`;
        let url = apiUrl + this.path;
        let options = this.options;

        let headers = {
            "User-Agent": UserAgent
        };

        if (this.options.auth && this.options.auth !== false) headers.Authorization = this.client.rest.auth();
        if (this.options.reason) headers['X-Audit-Log-Reason'] = encodeURIComponent(this.options.reason);
        if (this.options.headers) headers = Object.assign(headers, this.options.headers);

        let body;
        if (this.options.data != null) {
            body = JSON.stringify(this.options.data);
            headers['Content-Type'] = 'application/json';
        }

        let controller = new AbortController();
        let timeout = setTimeout(() => controller.abort(), this.client.options.requestTimeout);

        return fetch(url, {
            method: this.method,
            headers,
            agent,
            body,
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));
    }
}

module.exports = HTTPRequest;