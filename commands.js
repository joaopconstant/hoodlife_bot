import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const EMBED_COMMAND = {
  name: "embed",
  description: "Crie e envie um embed personalizado",
  type: 1,
};

const ALL_COMMANDS = [EMBED_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
