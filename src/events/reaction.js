import { config } from "../config.js";

export async function handleReactionAdd(reaction, user) {
  // Ignorar reações do próprio bot
  if (user.bot) return;

  // Se a reação for parcial (mensagem antiga não cacheada), buscar dados completos
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Erro ao buscar mensagem (ReactionAdd):", error);
      return;
    }
  }

  // Verificar se é a mensagem correta
  if (reaction.message.id !== config.targetMessageId) return;

  // Verificar se é o emoji correto
  if (reaction.emoji.name !== config.targetEmoji) {
    return;
  }

  // Obter o membro do servidor e adicionar o cargo
  const guild = reaction.message.guild;
  if (!guild) return;

  try {
    const member = await guild.members.fetch(user.id);

    // Adicionar o novo cargo
    await member.roles.add(config.targetRoleId);

    // Remover o cargo antigo (se o usuário possuir)
    if (member.roles.cache.has(config.roleToRemoveId)) {
      await member.roles.remove(config.roleToRemoveId);
      console.log(
        `[+] Cargo 'Whitelisted' adicionado e cargo 'Visitor' removido para: ${user.tag}`
      );
    } else {
      console.log(`[+] Cargo 'Whitelisted' adicionado para usuário: ${user.tag}`);
    }
  } catch (err) {
    console.error("Falha ao adicionar cargo:", err);
  }
}
