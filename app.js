import express from "express";
import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
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
  // Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "embed") {
      const modal = new ModalBuilder()
        .setCustomId("embedModal")
        .setTitle("Criar Embed");

      const titleInput = new TextInputBuilder()
        .setCustomId("embedTitle")
        .setLabel("Título")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const descriptionInput = new TextInputBuilder()
        .setCustomId("embedDescription")
        .setLabel("Descrição")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const colorInput = new TextInputBuilder()
        .setCustomId("embedColor")
        .setLabel("Cor Hex (ex: #FF0000)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const imageInput = new TextInputBuilder()
        .setCustomId("embedImage")
        .setLabel("URL da Imagem")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const footerInput = new TextInputBuilder()
        .setCustomId("embedFooter")
        .setLabel("Texto do Rodapé")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder().addComponents(
        descriptionInput
      );
      const thirdActionRow = new ActionRowBuilder().addComponents(colorInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(imageInput);
      const fifthActionRow = new ActionRowBuilder().addComponents(footerInput);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
      );

      await interaction.showModal(modal);
    }
  }

  // Handle Modal Submissions
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "embedModal") {
      const title = interaction.fields.getTextInputValue("embedTitle");
      const description =
        interaction.fields.getTextInputValue("embedDescription");
      const color = interaction.fields.getTextInputValue("embedColor");
      const image = interaction.fields.getTextInputValue("embedImage");
      const footer = interaction.fields.getTextInputValue("embedFooter");

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
        await interaction.reply({
          content:
            "Erro ao criar embed. Verifique se o código de cor é válido.",
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
