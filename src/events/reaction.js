import { config } from "../config.js";

export async function handleReactionAdd(reaction, user) {
  // Ignorar bots
  if (user.bot) return;

  // Lidar com mensagens antigas (partials)
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Erro ao buscar mensagem partial:", error);
      return;
    }
  }

  // Validação rápida: mensagem e emoji corretos?
  if (
    reaction.message.id !== config.targetMessageId ||
    reaction.emoji.name !== config.targetEmoji
  ) {
    return;
  }

  const guild = reaction.message.guild;
  if (!guild) return;

  try {
    // Busca o membro para garantir que temos os dados mais recentes de cargos
    const member = await guild.members.fetch(user.id);

    // Adiciona o cargo alvo
    await member.roles.add(config.targetRoleId);

    // Remove o cargo antigo se o usuário tiver
    if (member.roles.cache.has(config.roleToRemoveId)) {
      await member.roles.remove(config.roleToRemoveId);
    }

    console.log(`[✓] Cargos atualizados para: ${user.tag}`);
  } catch (err) {
    console.error(`Erro ao atualizar cargos para ${user.tag}:`, err);
  }
}
