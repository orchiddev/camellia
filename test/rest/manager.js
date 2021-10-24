require('dotenv').config({ path: "../.env" });
const RESTManager = require("../../lib/rest/RESTManager");
const BaseClient = require("../../lib/client/BaseClient");
const HTTPRequest = require("../../lib/rest/HTTPRequest");
const Endpoints = require("../../lib/rest/Endpoints");

let client = new BaseClient();
client.token = process.env.DISCORD_TOKEN;
const manager = client.rest;

let res = manager.request("GET", Endpoints.GATEWAY_BOT, { auth: true });

res.then((d) => {
    console.log(d)
})