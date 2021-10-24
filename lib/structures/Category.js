const GuildChannel = require("./GuildChannel");
/**
 * A category of guild channels, whether text or voice ones.
 * @extends {GuildChannel}
 */
class Category extends GuildChannel {
    constructor(data, client) {
        super(data, client);
    }
}

module.exports = Category;