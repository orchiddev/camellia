const { Status, Events, ShardEvents, WSEvents, OP_CODES } = require("../../util/Constants");
const WebSocket = require("ws");
const ShardRatelimit = require("./ShardRatelimit");

let AWAIT_STATUSES = [Status.AWAITING_GUILDS, Status.IDENTIFYING];

/**
 * A shard, or an instance of a client.
 * @extends {WebSocket}
 */
class WebSocketShard extends WebSocket {
    constructor(manager, id) {
        super(`${manager.gateway}?v=${manager.client.options.ws.version}&encoding=etf&compress=zlib-stream`);

        if (this.readyState == WebSocket.OPEN && this.status == Status.READY) return this.terminate();

        /**
         * The manager that spanwed this shard
         * @type {WebSocketManager}
         */
        this.manager = manager;

        /**
         * The client belonging to the manager
         * @type {Client}
         */
        this.client = manager.client;

        /**
         * The message handler from the websocket manager.
         * @type {MessageHandler}
         */
        this.handler = manager.handler;

        /**
         * The ID of the shard, as given by the manager
         * @type {number}
         */
        this.id = id;

        /**
         * The object data for queueing requests, and handing
         * @type {ShardRatelimit}
         */
        this.ratelimit = new ShardRatelimit(this);

        /**
         * The current sequence of the shard
         * @type {number}
         */
        this.sequence = -1;

        /**
         * Whether or not the last heartbeat was acknowledged, or not.
         * @type {boolean}
         * @private
         */
        this.heartbeatAcknowledged = true;
    }

    connect() {
        return new Promise(async (resolve, reject) => {
            // some other events or something
            this.on(ShardEvents.READY, () => resolve());
            this.on(ShardEvents.CLOSE, this.onclose);

            this.status = (this.status == Status.DISCONNECTED) ? Status.RECONNECTING : Status.CONNECTING;
            this.connectedOn = Date.now();

            // handle messages
            this.on(ShardEvents.MESSAGE, this.onmessage);
        });
    }

    /**
     * Handles incoming websocket data
     * @param {MessageEvent} data The data from the websocket.
     * @private
     */
    async onmessage(data) {
        data = await this.handler.handle(data).catch((err) => {
            this.manager.client.emit(Events.SHARDING_ERROR, err, this.id);
        });

        if (!data) return;
        switch (data.t) {
            case WSEvents.READY:
                /**
                 * Emitted when the shard is connected to the gateway, but not fully ready yet.
                 * @event WebSocketShard#ready
                 */
                this.emit(ShardEvents.READY);

                this.sessionID = data.d.session_id;
                this.expectedGuilds = new Set(data.d.guilds.map(d => d.id));
                this.status = Status.AWAITING_GUILDS;
                this.heartbeatAcknowledged = true;

                this.sendHeartbeat();
                break;

            case WSEvents.RESUMED:
                /**
                 * Emitted when the shard resumes successfully
                 * @event WebSocketShard#resumed
                 */
                this.emit(ShardEvents.RESUMED);

                this.status = Status.READY;
                this.heartbeatAcknowledged = true;

                this.sendHeartbeat();
                break;
        }

        if (data.s > this.sequence) this.sequence = data.s;

        switch (data.op) {
            case OP_CODES.HELLO:
                this.heartbeat(data.d.heartbeat_interval); // set heartbeat:tm:
                this.identify(); // identify the client
                break;

            case OP_CODES.INVALID_SESSION:
                if (data.d) {
                    this.identifyResume();
                    return;
                }

                this.sequence = -1;
                this.sessionID = undefined;
                
                this.status = Status.RECONNECTING;
                this.emit(ShardEvents.INVALID_SESSION);
                break;
            case OP_CODES.RECONNECT:
                this.destroy({ close: 4000 });
                break;

            case OP_CODES.HEARTBEAT_ACK:
                this.acknowledgeHeartbeat();
                break;

            case OP_CODES.HEARTBEAT:
                this.sendHeartbeat(true); // server request
                break;

            default:
                this.manager.handle(this, data);
                if (this.status === Status.AWAITING_GUILDS && data.t === WSEvents.GUILD_CREATE) {
                    this.expectedGuilds.delete(data.d.id);
                    this.checkReady();
                }
                break;
        }
    }

    /**
     * Handles close data.
     * @param {CloseEvent} event The closing data.
     * @private
     */
    async onclose(event) {
        if (this.sequence !== -1) this.closeSequence = this.sequence;
        this.sequence = -1;

        this.heartbeat(-1);
        this.status = Status.DISCONNECTED;

        /**
         * Emitted when a shard's WebSocket closes.
         * @private
         * @event WebSocketShard#close
         * @param {CloseEvent} event The received event
         */
        this.emit(ShardEvents.CLOSE, event);
    }

    /**
     * Checks whether the shard is fully ready, or not.
     * @private
     */
    checkReady() {
        if (this.expectedGuilds.size == 0) {
            this.status = Status.READY;
            /**
             * Emitted when the shard is fully ready, and all of the guilds are added.
             * @event WebSocketShard#allReady
             //* @param {?Set<string>} unavailableGuilds Set of unavailable guilds, if any
             */
            this.emit(ShardEvents.ALL_READY);
            return;
        }

        this.readyTimeout = this.manager.client.setTimeout(() => {
            this.readyTimeout = undefined;
            this.status = Status.READY;
            this.emit(ShardEvents.ALL_READY, this.expectedGuilds);
        }, 15000);
    }

    /**
     * The function to set a timer and send a heartbeat
     * @param {number} time The interval to send a heartbeat with.
     * @private
     */
    heartbeat(time) {
        if (time == -1) {
            if (this.heartbeatInterval) {
                this.client.clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = undefined;
            }
            return;
        }

        if (this.heartbeatInterval) this.client.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = this.client.setInterval(() => this.sendHeartbeat(), time);
    }

    /**
     * Sends a heartbeat to the gateway.
     * @private
     */
    sendHeartbeat(statuses) {
        if ((statuses || AWAIT_STATUSES.includes(this.status)) && !this.heartbeatAcknowledged) {

        } else if (!this.heartbeatAcknowledged) {
            this.destroy({ close: 4009, reset: true });
            return;
        }

        this.heartbeatAcknowledged = false;
        this.lastPingTimestamp = Date.now();
        this.send({ op: OP_CODES.HEARTBEAT, d: this.sequence });
    }  /**
    * Identifies the client on the connection.
    * @private
    * @returns {void}
    */
    identify() {
        return this.sessionID ? this.identifyResumed() : this.identifyNewConnection();
    }

    /**
     * Identifies the shard as a new connection on the gateway.
     * @private
     */
    identifyNewConnection() {
        if (!this.client.token) return;

        this.status = Status.IDENTIFYING;

        this.send({
            op: OP_CODES.IDENTIFY,
            d: {
                token: this.client.token,
                shard: [this.id, Number(this.client.options.shardCount)],
                intents: this.client.options.intents,
                ...this.client.options.ws
            }
        }, true);
    }

    /**
     * Resumes a closed session on the gateway.
     * @private
     */
    identifyResumed() {
        if (!this.sessionID) {
            this.identifyNew();
            return;
        }

        this.status = Status.RESUMING;

        this.send({
            op: OP_CODES.RESUME,
            d: {
                token: this.client.token,
                session_id: this.sessionID,
                seq: this.closeSequence,
            }
        }, true);
    }

    /**
     * Handles the ratelimit queue and pushes data to it to be sent to the gateway.
     * @param {Object} data The data to send.
     * @param {Object} [important = false] Whether or not the data is important, and to put it at the start of the queue or not.
     * @private
     */
    send(data, important = false) {
        this.ratelimit.queue[important ? "unshift" : "push"](data);
        this.ratelimit.handle();
    }

    /**
     * Sends data to the gateway.
     * @param {Object} data The data to send.
     * @private
     */
    _send(data) {
        if (this.readyState !== WebSocket.OPEN) return this.destroy({ close: 4000 });

        super.send(this.handler.pack(data), err => {
            if (err) this.manager.client.emit(Events.SHARDING_ERROR, err, this.id);
        });
    }

    /**
     * Acknowledges a heartbeat.
     * @private
     */
    acknowledgeHeartbeat() {
        this.heartbeatAcknowledged = true;
        this.ping = Date.now() - this.lastPingTimestamp;
    }

    /**
     * Destroys the shard, and its connections.
     * @param {Object} [options={}] The options for destroying the shard.
     * @param {number} [options.close=1000] The WS close code for destroying the shard.
     * @param {boolean} [options.reset=false] Whether to reset the shard's data, or not.
     */
    destroy(options = {
        close: 1000,
        reset: false
    }) {
        // Reset timers
        this.heartbeat(-1);

        if (this.readyState == WebSocket.OPEN) this.close(options.close);
        else {
            this._cleanup();

            try {
                this.close(options.close);
            } catch { } // nothing from the ws, incase;

            /**
             * Emitted whenever a shard is proclaimed destroyed.
             * @event WebSocketShard#destroyed
             */
            this.emit(ShardEvents.DESTROYED);
        }

        this.connection = null;

        this.status = Status.DISCONNECTED;

        if (this.sequence !== -1) this.closeSequence = this.sequence;

        if (options.reset) {
            this.sequence = -1;
            this.sessionID = undefined;
        }

        this.ratelimit.destroy();
    }
    /**
     * Cleanups all listeners, and ends them.
     * @private
     */
    _cleanup() {
        this.removeAllListeners(ShardEvents.OPEN);
        this.removeAllListeners(ShardEvents.CLOSE);
        this.removeAllListeners(ShardEvents.ERROR);
        this.removeAllListeners(ShardEvents.MESSAGE);
    }
}


/**
  * @external CloseEvent
  * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent}
  */

/**
 * @external ErrorEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent}
 */

/**
 * @external MessageEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent}
 */
module.exports = WebSocketShard;