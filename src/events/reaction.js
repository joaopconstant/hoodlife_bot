import { config } from "../config.js";

export async function handleReactionAdd(reaction, user) {
  console.log(`[REACTION] Reação detectada de ${user.tag}`);

  // Ignorar reações do próprio bot
  if (user.bot) {
    console.log(`[REACTION] Ignorando reação do bot`);
    return;
  }

  // Se a reação for parcial (mensagem antiga não cacheada), buscar dados completos
  if (reaction.partial) {
    console.log(
      `[REACTION] Mensagem parcial detectada, buscando dados completos...`
    );
    try {
      await reaction.fetch();
      console.log(`[REACTION] Mensagem completa carregada`);
    } catch (error) {
      console.error("[REACTION] Erro ao buscar mensagem:", error);
      return;
    }
  }

  console.log(
    `[REACTION] MessageID: ${reaction.message.id}, Target: ${config.targetMessageId}`
  );
  console.log(
    `[REACTION] Emoji: ${reaction.emoji.name}, Target: ${config.targetEmoji}`
  );

  // Verificar se é a mensagem correta
  if (reaction.message.id !== config.targetMessageId) {
    console.log(`[REACTION] Mensagem não é a target, ignorando`);
    return;
  }

  // Verificar se é o emoji correto
  if (reaction.emoji.name !== config.targetEmoji) {
    console.log(`[REACTION] Emoji diferente do esperado, ignorando`);
    return;
  }

  console.log(`[REACTION] ✓ Mensagem e emoji corretos! Processando...`);

  // Obter o membro do servidor e adicionar o cargo
  const guild = reaction.message.guild;
  if (!guild) {
    console.error(`[REACTION] Guild não encontrada`);
    return;
  }

  try {
    console.log(`[REACTION] Buscando membro ${user.tag}...`);
    const member = await guild.members.fetch(user.id);
    console.log(`[REACTION] Membro encontrado: ${member.user.tag}`);

    // Adicionar o novo cargo
    console.log(
      `[REACTION] Tentando adicionar cargo ${config.targetRoleId}...`
    );
    await member.roles.add(config.targetRoleId);
    console.log(`[REACTION] ✓ Cargo adicionado com sucesso!`);

    // Remover o cargo antigo (se o usuário possuir)
    if (member.roles.cache.has(config.roleToRemoveId)) {
      console.log(
        `[REACTION] Removendo cargo antigo ${config.roleToRemoveId}...`
      );
      await member.roles.remove(config.roleToRemoveId);
      console.log(
        `[✓] Cargo 'Whitelisted' adicionado e cargo 'Visitor' removido para: ${user.tag}`
      );
    } else {
      console.log(
        `[✓] Cargo 'Whitelisted' adicionado para usuário: ${user.tag}`
      );
    }
  } catch (err) {
    console.error("[REACTION] ❌ Falha ao processar cargo:", err);
    console.error("[REACTION] Detalhes do erro:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
  }
}
