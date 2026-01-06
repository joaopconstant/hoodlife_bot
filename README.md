# HoodLife Discord Bot

Bot de Discord com funcionalidades de gerenciamento de cargos e mensagens personalizadas.

## Funcionalidades

### 1. Sistema de Cargo por Reação

- Adiciona automaticamente um cargo quando um usuário reage com ✅ em uma mensagem específica
- Remove um cargo antigo (opcional) ao adicionar o novo
- Configurável através do arquivo `src/config.js`

### 2. Comando `/embed`

- Criador interativo de embeds personalizados
- Interface com botões para editar:
  - Título e descrição
  - Imagens (URL e thumbnail)
  - Estilo (cor, timestamp)
  - Autor e rodapé
- Preview em tempo real das alterações

### 3. Comando `/say`

- Faz o bot enviar uma mensagem simples no canal
- Útil para anúncios e comunicados

## Configuração

### Variáveis de Ambiente (.env)

```env
DISCORD_TOKEN=seu_token_aqui
APP_ID=seu_app_id_aqui
PORT=3000
```

### Configuração do Bot (src/config.js)

```javascript
{
  targetMessageId: "ID_DA_MENSAGEM",    // Mensagem que ativa o cargo
  targetRoleId: "ID_DO_CARGO",          // Cargo a ser adicionado
  roleToRemoveId: "ID_DO_CARGO_ANTIGO", // Cargo a ser removido (opcional)
  targetEmoji: "✅"                      // Emoji que ativa a reação
}
```

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais

4. Registre os comandos slash:

```bash
npm run register
```

5. Inicie o bot:

```bash
npm start
```

## Dependências

- **discord.js** - Biblioteca principal para interação com Discord
- **dotenv** - Gerenciamento de variáveis de ambiente
- **express** - Servidor HTTP para manter o processo ativo
- **nodemon** - Desenvolvimento com auto-reload (dev)

## Estrutura do Projeto

```
hl_bot/
├── src/
│   ├── config.js           # Configurações do bot
│   └── events/
│       └── reaction.js     # Handler de reações
├── app.js                  # Arquivo principal
├── commands.js             # Registro de comandos slash
├── utils.js                # Funções auxiliares
└── package.json
```

## Scripts Disponíveis

- `npm start` - Inicia o bot
- `npm run register` - Registra os comandos slash no Discord
- `npm run dev` - Inicia em modo desenvolvimento com nodemon
