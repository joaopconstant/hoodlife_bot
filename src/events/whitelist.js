import {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { config } from "../config.js";
import { questions } from "../utils/questions.js";

// Armazena a sessão ativa de whitelist de cada usuário
export const whitelistSessions = new Map();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function handleWhitelistInteractions(interaction) {
  // 1. Botão de Iniciar Whitelist
  if (interaction.isButton() && interaction.customId === "start_whitelist") {
    if (whitelistSessions.has(interaction.user.id)) {
      return interaction.reply({
        content: "Você já possui uma whitelist em andamento!",
        ephemeral: true,
      });
    }

    const guild = interaction.guild;
    const categoryId = config.whitelistCategoryId;
    
    try {
      const channelOptions = {
        name: `whitelist-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      };

      if (categoryId !== "COLOQUE_AQUI_O_ID_DA_CATEGORIA") {
        channelOptions.parent = categoryId;
      }

      const channel = await guild.channels.create(channelOptions);

      // Escolhe 5 perguntas randômicas
      const shuffledQuestions = shuffleArray([...questions]).slice(0, 5);

      whitelistSessions.set(interaction.user.id, {
        channelId: channel.id,
        selectedQuestions: shuffledQuestions,
        currentQuestionIndex: 0,
        scoreCorrect: 0,
        scoreHalf: 0,
        currentMapping: {},
      });

      await interaction.reply({
        content: `Sua whitelist começou em ${channel}. Boa sorte!`,
        ephemeral: true,
      });

      await sendNextQuestion(interaction.user.id, channel);
    } catch (error) {
      console.error("Erro ao criar canal de whitelist:", error);
      return interaction.reply({
        content: "Ocorreu um erro ao iniciar sua whitelist. Avise a staff ou verifique as permissões do bot.",
        ephemeral: true,
      });
    }
    return true; // <-- Adicionado
  }

  // 2. Select Menu de Respostas
  if (interaction.isStringSelectMenu() && interaction.customId === "whitelist_answer") {
    const session = whitelistSessions.get(interaction.user.id);
    if (!session || session.channelId !== interaction.channel.id) {
      return interaction.reply({
        content: "Esta sessão expirou ou é inválida.",
        ephemeral: true,
      });
    }

    const answerValue = interaction.values[0];
    const scoreType = session.currentMapping[answerValue];

    if (scoreType === "correct") session.scoreCorrect++;
    else if (scoreType === "half") session.scoreHalf++;

    session.currentQuestionIndex++;

    // Reconhece a interação e deleta a mensagem da pergunta atual para não poluir o canal
    await interaction.deferUpdate();
    try {
      await interaction.message.delete();
    } catch (e) {
      console.error("Erro ao deletar mensagem da pergunta:", e);
    }

    if (session.currentQuestionIndex < 5) {
      await sendNextQuestion(interaction.user.id, interaction.channel);
    } else {
      await finishWhitelist(interaction.user.id, interaction.channel, interaction.member);
    }
    return true; // <-- Adicionado
  }

  return false; // <-- Adicionado
}

async function sendNextQuestion(userId, channel) {
  const session = whitelistSessions.get(userId);
  const questionData = session.selectedQuestions[session.currentQuestionIndex];

  const options = [
    { text: questionData.correct, type: "correct" },
    { text: questionData.half, type: "half" },
    { text: questionData.wrong, type: "wrong" },
  ];
  shuffleArray(options);

  const letters = ["A", "B", "C"];
  const selectMenuOptions = [];
  session.currentMapping = {};

  let descriptionText = `**${session.currentQuestionIndex + 1}/5. ${questionData.question}**\n\n`;

  options.forEach((opt, index) => {
    const letter = letters[index];
    const optionValue = `opt_${index}`;
    session.currentMapping[optionValue] = opt.type;

    descriptionText += `**${letter})** ${opt.text}\n\n`;

    selectMenuOptions.push({
      label: `Opção ${letter}`,
      value: optionValue,
    });
  });

  const embed = new EmbedBuilder()
    .setTitle("Formulário de Whitelist")
    .setDescription(descriptionText)
    .setImage("https://r2.fivemanage.com/vwT8N75a6ApSQgOuFrwhH/whitelist2.png")
    .setColor("#5865F2")
    .setFooter({ text: "Leia atentamente e selecione a melhor opção abaixo." });

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("whitelist_answer")
      .setPlaceholder("Selecione sua resposta...")
      .addOptions(selectMenuOptions)
  );

  await channel.send({ content: `<@${userId}>`, embeds: [embed], components: [row] });
}

async function finishWhitelist(userId, channel, member) {
  const session = whitelistSessions.get(userId);
  const { scoreCorrect, scoreHalf } = session;

  // Critério atualizado: nota mínima de 4.5 para aprovação.
  // Correta = 1.0, Meio = 0.5. Mínimo = 4.5
  // (Ex: 4 corretas e 1 meio correta = 4.5 | 5 corretas = 5.0)
  const totalScore = (scoreCorrect * 1.0) + (scoreHalf * 0.5);
  const isApproved = totalScore >= 4.5;

  let resultMessage = "";

  if (isApproved) {
    resultMessage = `**Parabéns!** Você foi aprovado na whitelist.\nPontuação: ${totalScore} (Corretas: ${scoreCorrect}, Meio Corretas: ${scoreHalf})\n\nO canal será fechado em 10 segundos.`;
    
    try {
      if (config.targetRoleId) await member.roles.add(config.targetRoleId);
      if (config.roleToRemoveId && member.roles.cache.has(config.roleToRemoveId)) {
        await member.roles.remove(config.roleToRemoveId);
      }
    } catch (err) {
      console.error("Erro ao aplicar cargos da whitelist:", err);
    }
  } else {
    resultMessage = `**Infelizmente você reprovou.**\nVocê não atingiu o critério mínimo (Pontuação: ${totalScore}).\n\nO canal será fechado em 10 segundos.`;
  }

  const embed = new EmbedBuilder()
    .setTitle("Resultado da Whitelist")
    .setDescription(resultMessage)
    .setColor(isApproved ? "Green" : "Red");

  await channel.send({ embeds: [embed] });
  whitelistSessions.delete(userId);

  setTimeout(() => {
    channel.delete().catch(() => {});
  }, 10000);
}
