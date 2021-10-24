const Camellia = require("../../lib");

const embed = new Camellia.Embed();

embed.set("thumbnail", {
    uri: 'test'
});

embed.add("fields", [new Camellia.EmbedField("name", "value")])

console.log(embed)