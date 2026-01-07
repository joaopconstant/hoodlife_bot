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
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { config } from "./src/config.js";
import { handleReactionAdd } from "./src/events/reaction.js";

// ============================================
// CONFIGURAÇÃO DO BOT
// ============================================

const app = express();

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Necessário para gerenciar cargos
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
  ],
});

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}!`);
});

// ============================================
// SISTEMA DE EMBED INTERATIVO (/embed)
// ============================================

// State for the interactive embed builder
const embedStates = new Map();

function getEmbedBuilderRow() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("edit_content")
      .setLabel("Texto (Título/Desc)")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("edit_images")
      .setLabel("Imagens (URL/Thumb)")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("edit_style")
      .setLabel("Estilo (Cor/URL/Time)")
      .setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("edit_footer")
      .setLabel("Autor/Rodapé")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("send_embed")
      .setLabel("Enviar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("cancel_embed")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger)
  );
  return [row1, row2];
}

function buildEmbedFromState(state) {
  const embed = new EmbedBuilder();
  if (state.title) embed.setTitle(state.title);
  if (state.description) embed.setDescription(state.description);
  if (state.url) embed.setURL(state.url);
  if (state.color) {
    try {
      embed.setColor(state.color);
    } catch (e) {}
  }
  if (state.image) embed.setImage(state.image);
  if (state.thumbnail) embed.setThumbnail(state.thumbnail);
  if (state.footerText)
    embed.setFooter({
      text: state.footerText,
      iconURL: state.footerIcon || null,
    });
  if (state.authorName)
    embed.setAuthor({
      name: state.authorName,
      iconURL: state.authorIcon || null,
      url: state.authorURL || null,
    });
  if (state.timestamp) embed.setTimestamp();

  return embed;
}

// ============================================
// EVENT LISTENERS
// ============================================

// Sistema de cargo por reação
client.on("messageReactionAdd", handleReactionAdd);

// Comandos slash e interações

client.on("interactionCreate", async (interaction) => {
  // 1. Initial Slash Command
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "embed") {
      const initialState = {
        title: "Novo Embed",
        description: "Clique nos botões abaixo para editar este conteúdo!",
        color: "#2b2d31",
      };
      embedStates.set(interaction.user.id, initialState);

      await interaction.reply({
        content:
          "**Construtor de Embed Interativo**\nConfigure seu embed e clique em Enviar.",
        embeds: [buildEmbedFromState(initialState)],
        components: getEmbedBuilderRow(),
        ephemeral: true,
      });
    } else if (interaction.commandName === "say") {
      const message = interaction.options.getString("mensagem");

      try {
        await interaction.channel.send(message);
        await interaction.reply({
          content: "Mensagem enviada!",
          ephemeral: true,
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Erro ao enviar a mensagem.",
          ephemeral: true,
        });
      }
    }
  }

  // 2. Button Interactions
  if (interaction.isButton()) {
    const state = embedStates.get(interaction.user.id);
    if (!state)
      return interaction.reply({
        content: "Sessão expirada. Inicie o comando novamente.",
        ephemeral: true,
      });

    if (interaction.customId === "cancel_embed") {
      embedStates.delete(interaction.user.id);
      return interaction.update({
        content: "Criação cancelada.",
        embeds: [],
        components: [],
      });
    }

    if (interaction.customId === "send_embed") {
      await interaction.channel.send({ embeds: [buildEmbedFromState(state)] });
      embedStates.delete(interaction.user.id);
      return interaction.update({
        content: "Embed enviado com sucesso!",
        embeds: [],
        components: [],
      });
    }

    // Modal Opening Buttons
    const modal = new ModalBuilder()
      .setCustomId(`modal_${interaction.customId}`)
      .setTitle("Editar Embed");
    const rows = [];

    if (interaction.customId === "edit_content") {
      rows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Título")
            .setStyle(TextInputStyle.Short)
            .setValue(state.title || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(state.description || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("url")
            .setLabel("URL de Título")
            .setStyle(TextInputStyle.Short)
            .setValue(state.url || "")
            .setRequired(false)
        )
      );
    } else if (interaction.customId === "edit_images") {
      rows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("image")
            .setLabel("URL da Imagem")
            .setStyle(TextInputStyle.Short)
            .setValue(state.image || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("thumbnail")
            .setLabel("URL da Thumbnail (Miniatura)")
            .setStyle(TextInputStyle.Short)
            .setValue(state.thumbnail || "")
            .setRequired(false)
        )
      );
    } else if (interaction.customId === "edit_style") {
      rows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("color")
            .setLabel("Cor Hex (ex: #FF0000)")
            .setStyle(TextInputStyle.Short)
            .setValue(state.color || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("timestamp")
            .setLabel("Ativar Data e Hora? (sim/não)")
            .setStyle(TextInputStyle.Short)
            .setValue(state.timestamp ? "sim" : "não")
            .setRequired(false)
        )
      );
    } else if (interaction.customId === "edit_footer") {
      rows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("authorName")
            .setLabel("Nome do Autor")
            .setStyle(TextInputStyle.Short)
            .setValue(state.authorName || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("authorIcon")
            .setLabel("URL do Ícone do Autor")
            .setStyle(TextInputStyle.Short)
            .setValue(state.authorIcon || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footerText")
            .setLabel("Texto do Rodapé")
            .setStyle(TextInputStyle.Short)
            .setValue(state.footerText || "")
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footerIcon")
            .setLabel("URL do Ícone do Rodapé")
            .setStyle(TextInputStyle.Short)
            .setValue(state.footerIcon || "")
            .setRequired(false)
        )
      );
    }

    modal.addComponents(...rows);
    await interaction.showModal(modal);
  }

  // 3. Modal Submissions
  if (interaction.isModalSubmit()) {
    const state = embedStates.get(interaction.user.id);
    if (!state) return;

    // Update state based on which modal was submitted
    interaction.fields.fields.forEach((field) => {
      if (field.customId === "timestamp") {
        state.timestamp = field.value.toLowerCase() === "sim";
      } else {
        state[field.customId] = field.value;
      }
    });

    await interaction.update({
      embeds: [buildEmbedFromState(state)],
      components: getEmbedBuilderRow(),
    });
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

client.login(config.token);

// Servidor Express para manter o processo ativo
app.get("/", (req, res) => {
  res.send("Bot is running and listening for reactions!");
});

app.listen(config.port, () => {
  console.log("HTTP Server running on port", config.port);
});
