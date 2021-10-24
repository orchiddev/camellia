const erlpack = require('erlpack'); 
const zlib = require('zlib-sync');
const Util = require('../../util/Util');

/**
 * The message handler belonging to a manager, to decode all gateway messages, and hand them back.
 * @private
 */
class MessageHandler {
    constructor(manager) {
        /**
         * The shard manager that requires this handler
         * @type {WSManager}
         */
        this.manager = manager;

        /**
         * The method to decompress data
         * @type {?Inflate}
         */
        this.inflate = new zlib.Inflate({
            chunkSize: 65535,
            flush: zlib.Z_SYNC_FLUSH,
            to: 'etf',
        }); 
    }

    /**
     * Handles and decodes a gateway message.
     * @param {Buffer} data The data sent from the gateway.
     */
    async handle(data) {
        if (data instanceof ArrayBuffer) data = new Uint8Array(data);
        let suffix = data.length >= 4 && Util.compareBytes(Util.readBytes(data, -3), [0x00, 0x00, 0xFF, 0xFF]);

        if (!suffix) return; // no ZLIB_SUFFIX

        this.inflate.push(data, suffix && zlib.Z_SYNC_FLUSH);

        let message;
        try {
            message = this.unpack(this.inflate.result);
            if (this.manager.client.options.sendRawData)
                this.manager.client.emit(Events.DATA, message);
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(message);
    }

    /**
     * Packs data to be sent.
     * @param {*} data
     */
    pack(data) {
        return erlpack.pack(data);
    }
    
    /**
     * Unpacks sent data.
     * @param {Buffer} data 
     */
    unpack(data) {
        return erlpack.unpack(data)
    }
}

module.exports = MessageHandler;