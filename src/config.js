import "dotenv/config";

export const config = {
  // Use environment variables for secrets
  token: process.env.DISCORD_TOKEN,
  port: process.env.PORT || 3000,

  // Bot configuration constants
  whitelistChannelId: "1457456033583857767", // ID do canal onde ficará o botão "Iniciar Whitelist"
  whitelistCategoryId: "1500878083157262517", // ID da categoria onde os tickets serão criados
  targetRoleId: "1423494445805867148", // Cargo a adicionar na aprovação
  roleToRemoveId: "1454110873504190506", // Cargo a remover na aprovação
};
