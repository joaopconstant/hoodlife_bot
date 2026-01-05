import "dotenv/config";

export const config = {
  // Use environment variables for secrets
  token: process.env.DISCORD_TOKEN,
  port: process.env.PORT || 3000,

  // Bot configuration constants
  targetMessageId: "1457522794920153315",
  targetRoleId: "1423494445805867148",
  targetEmoji: "✅", // :white_check_mark:
};
