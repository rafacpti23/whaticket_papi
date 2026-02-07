# Whaticket PAPI Integration (v1.0)

Este é um fork personalizado do Whaticket, modificado para integrar nativamente com a **PAPI (WhatsApp API)**.

**Status do Docker:**
- Papi e Postgres rodando em docker.
- Front, Back e Redis: não estão ainda no docker-compose, pois ainda estão em desenvolvimento.

## 🚀 Funcionalidades Principais

Esta versão inclui correções e melhorias específicas para funcionar com gateways de API do WhatsApp (PAPI):

- **Integração Nativa PAPI**: Suporte completo para envio e recebimento de mensagens via API.
- **Suporte a LIDs**: Tratamento automático de contatos com identificadores LID (`@lid`), priorizando o número de telefone real (`remoteJidAlt` ou normalização) para evitar duplicidade e erros de envio.
- **Correção de Áudios**: Ajustes no fluxo de download de mídia e criação de contatos para evitar falhas ao receber áudios e imagens.
- **Webhooks Robustos**: Tratamento de eventos de `messages.upsert` e `connection.update` vindos da PAPI.
- **Histórico de Chat**: Correção para garantir que mensagens enviadas pela API sejam salvas e exibidas corretamente no chat (mesmo sem webhook de retorno de `fromMe`).

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, Sequelize (PostgreSQL), Socket.io
- **Frontend**: React, Material-UI
- **Banco de Dados**: PostgreSQL
- **Filas**: Redis + Bull

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 14+ ou 16+
- Docker & Docker Compose (Recomendado)
- PostgreSQL
- Redis

### Configuração (.env)

Copie o arquivo `.env.example` para `.env` no backend e frontend (se aplicável) e configure as variáveis essenciais:

```env
NODE_ENV=development
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
PROXY_PORT=8080
PORT=8080

DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=whaticket

JWT_SECRET=sua_senha_secreta
JWT_REFRESH_SECRET=sua_senha_secreta_refresh
```

### Rodando com Docker

O projeto inclui um `docker-compose.yml` pré-configurado.

```bash
docker-compose up -d --build
```

### Rodando Localmente

#### Backend

```bash
cd backend
npm install
npm run build
npm run db:migrate
npm run start
# ou para desenvolvimento
npm run dev:server
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## 🔌 Integração PAPI

Para que a integração funcione:

1.  **Nome da Instância**: No painel do Whaticket, crie uma conexão com o nome exato da instância na PAPI (ex: `pessoal`).
2.  **Webhook**: Configure o webhook na PAPI para apontar para o endpoint do Whaticket:
    *   URL: `https://seu-dominio-whaticket.com/api/papi/webhook/NOME_DA_INSTANCIA`
    *   Events: `messages.upsert`, `messages.update`, `connection.update`

## 📝 versionamento

- **v1.0**: Versão inicial com suporte a PAPI, correção de LIDs e envio de mensagens.

---
Desenvolvido/Modificado por [Ramel Tecnologia]

