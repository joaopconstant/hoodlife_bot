import express from "express";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./src/config.js";
import { handleReactionAdd } from "./src/events/reaction.js";

const app = express();

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}!`);
});

// Event Listeners
client.on("messageReactionAdd", handleReactionAdd);

client.login(config.token);

// Simple Express server to keep the process alive
app.get("/", (req, res) => {
  res.send("Bot is running and listening for reactions!");
});

app.listen(config.port, () => {
  console.log("HTTP Server running on port", config.port);
});
