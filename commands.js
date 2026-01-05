import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const EMBED_COMMAND = {
  name: "embed",
  description: "Crie e envie um embed personalizado",
  type: 1,
};

const SAY_COMMAND = {
  name: "say",
  description: "Faz o bot dizer uma mensagem simples",
  options: [
    {
      type: 3, // String
      name: "mensagem",
      description: "A mensagem que o bot deve enviar",
      required: true,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [EMBED_COMMAND, SAY_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
