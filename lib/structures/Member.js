const Base = require("./Base");
const Endpoints = require("../rest/Endpoints");

/**
 * A member of a guild.
 * @extends {Base}
 */
class Member extends Base {
    constructor(data, client) {
        super(client);

        /**
         * The ID of this member.
         * @type {Snowflake}
         */
        this.id = data.user.id;

        this._update(data);
    }

    _update(data) {
        /**
         * The user object of this member.
         * @type {User}
         */
        this.user = client.users.get(this.id);

        /**
         * The nickname of this member, if any.
         * @type {?string}
         */
        this.nickname = data.nickname ?? null;

        /**
         * The ISO8601 timestamp this user started boosting the guild.
         * @type {?string}
         */
        this.boosting_since = data.premium_since ?? null;
    }

    /**
     * Whether or not the member is boosting the guild, or not.
     * @type {boolean}
     */
    get boosting() {
        return this.boosting_since ? true : false;
    }

    static async _fetch({ guildID, id }, client) {
        let data = new Member(await client.rest.request("GET", Endpoints.GUILD_MEMBER(guildID, id), { auth: true }).catch((err) => {
            return Promise.reject(err);
        }), client);

        return Promise.resolve(data);
    }
}

module.exports = Member;