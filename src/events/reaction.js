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
    await member.roles.add(config.targetRoleId);
    console.log(`[+] Cargo adicionado para usuário: ${user.tag}`);
  } catch (err) {
    console.error("Falha ao adicionar cargo:", err);
  }
}
