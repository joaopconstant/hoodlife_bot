# Troubleshooting - Cargo por Reação

## Alterações Realizadas

### 1. Intents e Partials Adicionados

- ✅ **GuildMembers Intent**: Necessário para que o bot possa acessar e modificar informações de membros
- ✅ **GuildMember Partial**: Necessário para lidar com reações em mensagens antigas que não estão em cache

### 2. Logs Detalhados

Adicionados logs extensivos para facilitar o debug:

- Log quando uma reação é detectada
- Log dos IDs de mensagem e emoji comparados
- Log de cada passo do processo (buscar membro, adicionar cargo, remover cargo)
- Log detalhado de erros com código e mensagem

## Checklist de Verificação

### 1. Permissões do Bot no Discord Developer Portal

O bot precisa ter as seguintes permissões:

- ✅ **Manage Roles** (Gerenciar Cargos)
- ✅ **Read Message History** (Ler Histórico de Mensagens)
- ✅ **Add Reactions** (Adicionar Reações)

### 2. Privileged Gateway Intents

No Discord Developer Portal, vá em **Bot** e ative:

- ✅ **SERVER MEMBERS INTENT** (Privileged)
- ✅ **MESSAGE CONTENT INTENT** (Privileged)

**IMPORTANTE**: Sem essas intents habilitadas no portal, o bot não funcionará mesmo com o código correto!

### 3. Hierarquia de Cargos

- ✅ O cargo do bot deve estar **acima** dos cargos que ele vai gerenciar
- ✅ Verifique na configuração do servidor se a hierarquia está correta

### 4. Variáveis de Ambiente

Verifique se o arquivo `.env` contém:

```env
DISCORD_TOKEN=seu_token_aqui
PORT=3000
```

### 5. IDs Corretos no config.js

Verifique se os IDs estão corretos:

- `targetMessageId`: ID da mensagem que receberá a reação
- `targetRoleId`: ID do cargo a ser adicionado ("Whitelisted")
- `roleToRemoveId`: ID do cargo a ser removido ("Visitor")
- `targetEmoji`: Emoji que ativa o sistema (✅)

## Como Testar

### 1. Reiniciar o Bot

```bash
npm start
```

### 2. Verificar os Logs

Quando alguém reagir à mensagem, você deve ver:

```
[REACTION] Reação detectada de Usuario#1234
[REACTION] MessageID: 1457863518874243125, Target: 1457863518874243125
[REACTION] Emoji: ✅, Target: ✅
[REACTION] ✓ Mensagem e emoji corretos! Processando...
[REACTION] Buscando membro Usuario#1234...
[REACTION] Membro encontrado: Usuario#1234
[REACTION] Tentando adicionar cargo 1423494445805867148...
[REACTION] ✓ Cargo adicionado com sucesso!
```

### 3. Se Não Funcionar

Verifique qual mensagem de log aparece para identificar onde está o problema:

- **Nenhum log aparece**: O evento não está sendo detectado
  - Verifique as Intents no Developer Portal
  - Verifique se o bot tem permissão para ver reações
- **"Mensagem não é a target"**: ID da mensagem está errado
  - Atualize `targetMessageId` no `config.js`
- **"Emoji diferente do esperado"**: Emoji está errado
  - Verifique se o emoji no código é o mesmo usado na reação
- **Erro ao adicionar cargo**: Problema de permissões
  - Verifique hierarquia de cargos
  - Verifique permissão "Manage Roles" do bot

## Comandos Úteis

### Obter ID de uma Mensagem

1. Ative o Modo Desenvolvedor no Discord (Configurações > Avançado > Modo Desenvolvedor)
2. Clique com botão direito na mensagem
3. Selecione "Copiar ID"

### Obter ID de um Cargo

1. Configurações do Servidor > Cargos
2. Clique com botão direito no cargo
3. Selecione "Copiar ID"

### Obter ID de um Emoji

- Para emoji padrão (como ✅): use o próprio emoji
- Para emoji personalizado: `\:nome_do_emoji:` no chat e copie o resultado

## Próximos Passos

1. Certifique-se de que as **Privileged Gateway Intents** estão ativadas no Discord Developer Portal
2. Reinicie o bot
3. Teste reagindo à mensagem configurada
4. Observe os logs para identificar onde está o problema
5. Se o erro persistir, compartilhe os logs para análise
