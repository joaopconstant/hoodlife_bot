import express from "express";
import { Client, GatewayIntentBits, Partials, EmbedBuilder } from "discord.js";
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "embed") {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("color");
    const image = interaction.options.getString("image");
    const footer = interaction.options.getString("footer");

    try {
      const embed = new EmbedBuilder();

      if (title) embed.setTitle(title);
      if (description) embed.setDescription(description);
      if (color) embed.setColor(color);
      if (image) embed.setImage(image);
      if (footer) embed.setFooter({ text: footer });

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Embed enviado com sucesso!",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content:
            "Erro ao enviar embed. Verifique se os dados estão corretos (ex: código de cor válido).",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "Erro ao enviar embed. Verifique se os dados estão corretos (ex: código de cor válido).",
          ephemeral: true,
        });
      }
    }
  }
});

client.login(config.token);

// Simple Express server to keep the process alive
app.get("/", (req, res) => {
  res.send("Bot is running and listening for reactions!");
});

app.listen(config.port, () => {
  console.log("HTTP Server running on port", config.port);
});
