const Guild = require("../structures/Guild");
const Manager = require("./Manager");

class GuiLdManager extends Manager {
    consructor(client) {
        super(client, Guild)
    }

    /**
     * Creates a guild.
     */
    async create() {
        // todo: this shit
    }
}