import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const EMBED_COMMAND = {
  name: "embed",
  description: "Crie e envie um embed personalizado",
  options: [
    {
      type: 3, // String
      name: "title",
      description: "O título do embed",
      required: false,
    },
    {
      type: 3, // String
      name: "description",
      description: "A descrição do embed",
      required: false,
    },
    {
      type: 3, // String
      name: "color",
      description: "Cor em Hex (ex: #FF0000)",
      required: false,
    },
    {
      type: 3, // String
      name: "image",
      description: "URL da imagem",
      required: false,
    },
    {
      type: 3, // String
      name: "footer",
      description: "Texto do rodapé",
      required: false,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [EMBED_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
