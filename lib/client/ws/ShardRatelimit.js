
/**
 * The manager to limit gateway requests. 
 * For more information about Gateway Rate-limiting, visit {@link https://ptb.discord.com/developers/docs/topics/gateway#rate-limiting} for such.
 * @private
 */
class ShardRatelimit {
    constructor(shard) {
        /**
         * The shard that spawned this manager.
         * @type {WebSocketShard}
         */
        this.shard = shard;

        /**
         * The queue for requests.
         * @type {Array<Object>}
         */
        this.queue = [];

        /**
         * The total requests allowed
         * @type {number}
         */
        this.total = 120;

        /**
         * The remaining requests allowed
         * @type {number}
         */
        this.remaining = this.total;

        /**
         * The time (in milliseconds) for which {@link ShardRatelimit#remaining} gets reset.
         * @type {number}
         */
        this.time = 60e3;

        /**
         * The timer for until {@link ShardRatelimit#remaining} gets reset.
         * @type {Timeout}
         */
        this.timer = this.shard.client.setTimeout(() => {
            this.remaining = this.total;
            this.handle();
        }, this.time);
    }

    /**
     * Handles the current queue.
     * @private
     */
    handle() {
        if (this.remaining == 0 || this.queue.length == 0) return;
        else if (this.remaining == this.total) {
            clearTimeout(this.timer);
            this.timer = this.shard.client.setTimeout(() => this.remaining = this.total);
        }

        while (this.remaining > 0) {
            let item = this.queue.shift();
            if (!item) return;

            this.shard._send(item);
            this.remaining--;
        }
    }

    /**
     * Destroys the current ratelimit manager.
     * @returns {null}
     */
    destroy() {
        if (this.timer) {
            this.shard.client.clearTimeout(this.timer);
            this.timer = null;
        }

        return null;
    }
}

module.exports = ShardRatelimit;