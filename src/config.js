import "dotenv/config";

export const config = {
  // Use environment variables for secrets
  token: process.env.DISCORD_TOKEN,
  port: process.env.PORT || 3000,

  // Bot configuration constants
  targetMessageId: "1457863518874243125",
  targetRoleId: "1423494445805867148",
  roleToRemoveId: "1454110873504190506",
  targetEmoji: "✅", // :white_check_mark:
};
