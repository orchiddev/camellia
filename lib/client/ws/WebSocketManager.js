const EventEmitter = require("events");
const Collection = require("../../util/Collection");
const { Status, WSEvents, ShardEvents, Events } = require("../../util/Constants");
const Endpoints = require("../../rest/Endpoints");
const CamelliaError = require("../../errors/CamelliaError");
const WebSocketShard = require("./WebSocketShard");
const Util = require("../../util/Util");
const MessageHandler = require("./MessageHandler");
const WebSocketError = require("../../errors/WebSocketError");


const BeforeReady = [
    WSEvents.READY,
    WSEvents.RESUMED,
    WSEvents.GUILD_CREATE
];

const UNRECOVERABLE_CODES = [
    4004,
    4010,
    4011,
    4013,
    4014
];

const UNRESUMABLE_CODES = [
    1000,
    4006, 
    4007
];

const ERRORABLE_CODES = [
    4013,
    4014
]

/**
 * The manager for all websocket connections, for sending and recieving all gateway events.
 * @extends EventEmitter
 */
class WebSocketManager extends EventEmitter {
    constructor(client) {
        super();

        /**
         * The client that instantiated this WebSocketManager
         * @type {Client}
         */
        this.client = client;

        /**
         * The message handler belonging to this manager
         * @type {MessageHandler}
         */
        this.handler = new MessageHandler(this);

        /**
         * A collection of all the shards this WebSocket manager manages.
         * @type {Collection<number, WebSocketShard>}
         */
        this.shards = new Collection();

        /**
         * The queue for shards that need to be connected, or need to be reconnected
         * @type {Set<WebSocketShard>}
         */
        this.queue = new Set();

        /**
         * The status of this manager.
         * @type {Status}
         */
        this.status = Status.IDLE;

        /**
         * Whether or not this manager is destroyed, or disposed of.
         * @type {boolean}
         */
        this.destroyed = false;

        /**
         * Whether or not this manager is in the process of reconnecting a shard.
         * @type {boolean}
         */
        this.reconnecting = false;

        /**
         * The current session limit
         * @type {?Object}
         * @prop {number} total Total number of identifies available
         * @prop {number} remaining Number of identifies remaining
         * @prop {number} reset_after Number of milliseconds after which the limit resets
         */
        this.sessionStartLimit = undefined;

        /**
         * The queue of data to handle.
         * @type {Set}
         */
        this.dataQueue = [];
    }

    /**
     * Begins a connection to the gateway.
     * @private
     */
    async connect() {
        let res = await this.client.rest.request("GET", Endpoints.GATEWAY_BOT(), { auth: true }).catch((err) => {
            throw err.httpStatus === 401 ? new CamelliaError("TOKEN_MISSING") : err;
        });

        this.gateway = res.url;

        this.sessionStartLimit = res.session_start_limit;
        let shards = this.client.options.shards;

        if (shards == "auto") {
            this.totalShards = res.shards;
            this.client.options.shardCount = res.shards;
            shards = Array.from({ length: res.shards }, (_, i) => i);
        }

        this.totalShards = (shards === "auto") ? res.shards : shards.length;
        this.queue = new Set(shards.map(_id => new WebSocketShard(this, _id)));

        // delay session limits
        if (this.sessionStartLimit.remaining == "undefined" && this.sessionStartLimit.reset_after === 0) {
            res = await this.client.rest.request("GET", Endpoints.GATEWAY_BOT(), { auth: true });
            this.sessionStartLimit = res.sessionStartLimit;
        }

        if (!this.sessionStartLimit.remaining) await Util.delay(this.sessionStartLimit.reset_after);

        return this.spawn();
    }

    /**
     * Handles shard reconnection.
     * @param {boolean} skipLimit 
     */
    async reconnect(skipLimit = false) {
        if (this.reconnecting || this.status !== Status.READY) return false;
        this.reconnecting = true;

        try {
            if (!skipLimit) {
                // delay session limits
                if (this.sessionStartLimit.remaining == "undefined" && this.sessionStartLimit.reset_after === 0) {
                    res = await this.client.rest.request("GET", Endpoints.GATEWAY_BOT(), { auth: true });
                    this.sessionStartLimit = res.sessionStartLimit;
                }

                if (!this.sessionStartLimit.remaining) await Util.delay(this.sessionStartLimit.reset_after);
            }

            await this.spawn();
        } catch (e) {
            if (e.httpStatus !== 401) {
                await Util.delayFor(5000);
                this.reconnecting = false;
                return this.reconnect();
            }

            if (this.client.listenerCount(Events.INVALIDATED)) {
                /**
                 * Emitted when the client's session becomes invalidated.
                 * @event Client#invalidated
                 */
                this.client.emit(Events.INVALIDATED);
                this.destroy();
            } else {
                this.client.destroy();
            }
        }

        this.reconnecting = false;
        return true;
    }

    /**
     * Begins spawning shards, and the creation of them.
     * @returns {boolean}
     * @private
     */
    async spawn() {
        if (!this.queue.size) return false;

        let [shard] = this.queue;
        this.queue.delete(shard);

        this._handleShardEvents(shard);

        this.shards.set(shard.id, shard);

        try {
            await shard.connect();
        } catch (error) {
            if (error && (error.code ? UNRECOVERABLE_CODES.includes(error.code) : false)) throw new WebSocketError(error.code);
            else if (!error || error.code) this.queue.add(shard);
            else throw error;
        }

        if (this.queue.size > 0) {
            await Util.delay(5000);

            if (this.sessionStartLimit.remaining == "undefined" && this.sessionStartLimit.reset_after === 0) {
                res = await this.client.rest.request("GET", Endpoints.GATEWAY_BOT(), { auth: true });
                this.sessionStartLimit = res.sessionStartLimit;
            }

            if (!this.sessionStartLimit.remaining) await Util.delay(this.sessionStartLimit.reset_after)
            return this.spawn();
        }

        return true;
    }

    /**
     * Handle the events of a shard.
     * @param {Buffer} shard The shard to handle the data of.
     * @private
     */
    async _handleShardEvents(shard) {
        if (!shard.eventsHandled) {
            shard.on(ShardEvents.ALL_READY, (unavailable) => {
                this.client.emit(Events.SHARD_READY, shard.id, unavailable);

                if (!this.queue.size) this.reconnecting = false;
                this.awaitReady();
            });

            shard.on(ShardEvents.CLOSE, event => {
                if (ERRORABLE_CODES.includes(event)) {
                    throw new WebSocketError(event);
                    return;
                }

                if (event === 1000 ? this.destroyed : UNRECOVERABLE_CODES.includes(event)) {
                    /**
                     * Emitted when a shard disconnects from the gateway, and will no longer properly reconnect.
                     * @event Client#shardDead
                     * @param {CloseEvent} event The WebSocket close event.
                     * @param {WebSocketShard} shard The shard that disconnected.
                     */
                    this.client.emit(Events.SHARD_DEAD, event, shard);
                    this.debug(WSCodes[event], shard);
                    return;
                }

                if (UNRESUMABLE_CODES.includes(event)) shard.sessionID = undefined;

                /**
                 * Emitted when a shard is attempting to reconnect, or re-identify.
                 * @event Client#shardReconnect
                 * @param {WebSocketShard} id The shard that is attempting to reconnect
                 */
                this.client.emit(Events.SHARD_RECONNECT, shard);
                this.queue.add(shard);
            });

            shard.on(ShardEvents.INVALID_SESSION, () => {
                this.client.emit(Events.SHARD_RECONNECT, shard);
            });
        }
    }

    /**
     *
     * Handles sent data from the gateway.
     * @param {*} shard The shard to give data back to.
     * @param {*} data The data to handle.
     * @returns {boolean}
     * @private
     */
    handle(shard, data) {
        if (data && this.status !== Status.READY) {
            if (!BeforeReady.includes(data.t)) {
                this.dataQueue.push({ data, shard });
                return false;
            }
        }

        if (this.queue.length > 0) {
            let item = this.queue.shift();
            this.client.setImmediate(() => {
                this.handlePacket(item.data, item.shard);
            });
        }

        try {
            if (data && require("./events/" + data.t)) require("./events/" + data.t)(this.client, data.d, shard);
        } catch (e) {
        } // event not exist

        return true;
    }

    async awaitReady() {
        if (this.status == Status.READY || this.shards.size !== this.totalShards) return;

        this.status = Status.READY;
        this.client.readyAt = Date.now();

        /**
         * Emitted when the client is ready for usage.
         * @event Client#ready
         */
        this.client.emit(Events.READY);
    }
}

module.exports = WebSocketManager;