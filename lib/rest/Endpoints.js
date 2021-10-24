/**
 * All of the provided enpoints in the Discord API.
 * @typedef {Object} Endpoints
 */
module.exports = {
    GATEWAY: () => "/gateway",
    GATEWAY_BOT: () => "/gateway/bot",

    // Guild Endpoints
    GUILD: (guildID) => `/guilds/${guildID}`,
    GUILD_PREVIEW: (guildID) => `/guilds/${guildID}/preview`,
    GUILDS: () => `/guilds`,

    GUILD_MEMBER: (guildID, memberID) => `/guilds/${guildID}/members/${memberID}`,
    GUILD_MEMBERS: (guildID) => `/guilds/${guildID}/members`,

    // Message Endpoints
    MESSAGE: (channelID, messageID) => `/channels/${channelID}/messages/${messageID}`,
    MESSAGES: (channelID) => `/channels/${channelID}/messages`,

    // Channel Endpoints
    CHANNEL: (channelID) => `/channels/${channelID}`,

    // User Endpoints
    USER: (userID) => `/users/${userID}`,

    // Webhook Endpoints
    WEBHOOK: (webhookID, webhookToken) => `/webhooks/${webhookID}/${webhookToken}`,

    // General Endpoints
    CDN: (root) => {
        return {
            Emoji: (emojiID, format = 'png') => `${root}/emojis/${emojiID}.${format}`,
            Asset: name => `${root}/assets/${name}`,
            DefaultAvatar: discriminator => `${root}/embed/avatars/${discriminator}.png`,
            Avatar: (userID, hash, format = 'webp', size, dynamic = false) => {
                if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
                return makeImageUrl(`${root}/avatars/${userID}/${hash}`, { format, size });
            },
            Banner: (guildID, hash, format = 'webp', size) =>
                makeImageUrl(`${root}/banners/${guildID}/${hash}`, { format, size }),
            Icon: (guildID, hash, format = 'webp', size, dynamic = false) => {
                if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
                return makeImageUrl(`${root}/icons/${guildID}/${hash}`, { format, size });
            },
            AppIcon: (clientID, hash, { format = 'webp', size } = {}) =>
                makeImageUrl(`${root}/app-icons/${clientID}/${hash}`, { size, format }),
            AppAsset: (clientID, hash, { format = 'webp', size } = {}) =>
                makeImageUrl(`${root}/app-assets/${clientID}/${hash}`, { size, format }),
            GDMIcon: (channelID, hash, format = 'webp', size) =>
                makeImageUrl(`${root}/channel-icons/${channelID}/${hash}`, { size, format }),
            Splash: (guildID, hash, format = 'webp', size) =>
                makeImageUrl(`${root}/splashes/${guildID}/${hash}`, { size, format }),
            TeamIcon: (teamID, hash, { format = 'webp', size } = {}) =>
                makeImageUrl(`${root}/team-icons/${teamID}/${hash}`, { size, format }),
        };
    },
}