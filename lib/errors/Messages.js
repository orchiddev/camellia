// Library related errors.
module.exports.LIBRARY = {
    EMPTY: "No error message was provided.",
    // Message Errors
    MESSAGE_INVALID: "The provided content is invalid!",
    MESSAGE_EMPTY: "The content is an empty string!",

    // Webhook Errors
    WEBHOOK_INVALID: "The ID or token provided is invalid.",

    // embed Errors
    EMBED_INVALID: (index) => `The ${index} key of the embed is not supposed to be empty.`,
    EMBED_ARRAY_INVALID: (index) => `The ${index} key of the embed is not a proper array!`,
    EMBED_FIELD_NAME: "An embed field cannot have an empty name.",
    EMBED_FIELD_VALUE: "An embed field cannot have an empty value.",

    // Token Errors
    TOKEN_MISSING: "You're missing a token!",
    TOKEN_INVALID: "This token is missing, or invalid."
}

// WebSocket related errors.
module.exports.WS = {
    4000: "An unknown websocket error has occured.",
    4001: "You have sent an unknown opcode.",
    4002: "The gateway could not decode our query.",
    4003: "We are not authenticated yet.",
    4004: "The token provided is invalid.",
    4005: "The client is already authenticated.",
    4007: "The sequence sent when resuming was invalid.",
    4008: "The client has sent too many packets.",
    4009: "Our session timed out.",
    4010: "The shard sent was invalid.",

    // INTENT ERRORS
    4013: "An invalid intent value was provided.",
    4014: "A privileged intent that is disallowed was included in the intent value!"
};

// Rest API related errors.
module.exports.REST = {

}