module.exports = {
    // Base classes
    BaseClient: require("./client/BaseClient"),
    Client: require("./client/Client"),
    WebhookClient: require("./client/WebhookClient"),

    // Utilities
    Collection: require("./util/Collection"),
    Manager: require("./managers/Manager"),
    Util: require("./util/Util"),
    version: require("../package.json").version,

    // Errors
    CamelliaError: require("./errors/CamelliaError"),
    DiscordAPIError: require("./errors/DiscordAPIError"),
    RequestError: require("./errors/RequestError"),
    WebSocketError: require("./errors/WebSocketError"),

    // Constants
    Constants: require("./util/Constants"),
    Endpoints: require("./rest/Endpoints"),
    Messages: require("./errors/Messages"),

    // Structures
    Base: require("./structures/Base"),
    Channel: require("./structures/Channel"),
    Guild: require("./structures/Guild"),
    GuildChannel: require("./structures/GuildChannel"),
    TextChannel: require("./structures/TextChannel"),
    Message: require("./structures/Message"),
    Embed: require("./structures/Embed"),
    EmbedField: require("./structures/typedefs/EmbedField"),
    Webhook: require("./structures/Webhook"),

    // Typedefs
    Enum: require("./structures/typedefs/Enum"),
    Snowflake: require("./structures/typedefs/Snowflake")
}