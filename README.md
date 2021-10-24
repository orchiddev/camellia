<br>
<div align="center">
    <img src="https://github.com/orchiddev/camellia/blob/master/icons/camellia.png?raw=true" height="128" width="128"/>
    <h2>Camellia</h2>
    <h6><i>- The respectful Node.js Discord library -</i></h6>
    <br>
    <p>
        <a href="https://discord.gg/CBNJ9ww"><img src="https://discord.com/api/guilds/729270022270353419/embed.png"></a>
        <a href="npmjs.com/package/camellia.js"><img src="https://img.shields.io/npm/dm/camellia.js"></a>
        <a href="https://github.com/orchiddev/camellia"><img src="https://img.shields.io/github/package-json/v/orchiddev/camellia"></a>
    </p>
</div>

## About
Camellia is a Discord library built in JavaScript for practical and advanced measures, enforcing and upholding performance and speed over true consistency, built in a way like [C](https://en.wikipedia.org/wiki/C_(programming_language)) is. Rather than relying heavily on other modules, it creates its own advantages in performance by using home made and native solutions. *"Native"* in our sense is defined as "utilizing its own code rather than external modules", preferrably using our own solutions than others, to optimize and maintain our iterations of such.

Camellia aims to be feature-rich, while balancing abstraction and performance along in the mix. Utilizing promises for prominent speeds with responses, and lessening the overall load on a developer by providing advanced coverage of the Discord API and it's features.

In short: This project aims to provide a viable and advanced alternative to [discord.js](https://github.com/discordjs/discord.js) and [eris](https://github.com/abalabahaha/eris), much like when [discordie](https://github.com/qeled/discordie) was at it's prime.

### Why use Camellia?
- Object/Function-oriented calls
- Performant and capable
    - Fitted heavily for server-usage
- Advanced features
- Easy control over code
- Asynchrous methods

## Installation
*Node.js v14 or higher is required for this library.*

As this library is in heavy beta, the only true way to install it is through it's development builds.
```
nothing yet
```
#### Optional Packages
As of writing this, there are currently no optional packages. Most of the would-be optional packages are necessities towards building speed with the library.

## Example code
```js
const Camellia = require("camellia");
const bot = new Camellia.Client();

client.on("ready", () => {
    console.log("Ready for usage!");
});

client.on("message", (msg) => {
    if (msg.content === "!ping") {
        msg.channel.send("Pong!");
    }
});

client.connect("token");
```

## Links
* [Discord](https://discord.gg/CBNJ9ww)
* [Github](https://github.com/orchiddev/camellia) ([Organization](https://github.com/orchiddev))
* [Related Libraries](http://discordapi.com/unofficial/libs.html)