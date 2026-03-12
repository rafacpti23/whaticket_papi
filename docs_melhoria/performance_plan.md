# Plano de Melhoria de Desempenho - Whaticket

Este documento detalha as oportunidades de melhoria identificadas no sistema após análise do código-fonte e do ambiente de execução.

## 🚀 Melhorias de Performance (Backend)

### 1. Sistema de Cache com Redis
Identificamos que serviços críticos como `ShowWhatsAppService` e `ShowUserService` realizam consultas complexas com múltiplos `JOINs` no banco de dados para cada mensagem processada.
- **Ação:** Implementar uma camada de cache no Redis para estas configurações, invalidando o cache apenas quando houver alteração nas configurações.
- **Impacto:** Redução drástica na latência de processamento de mensagens.

### 2. Otimização de Consultas SQL
O uso da função `unaccent` em buscas de contatos desabilita os índices padrão do PostgreSQL.
- **Ação:** Criar índices baseados em expressões: `CREATE INDEX contacts_name_unaccent_idx ON "Contacts" (unaccent(lower(name)));`
- **Impacto:** Buscas de contatos instantâneas, mesmo com milhares de registros.

### 3. Redução de Redundância no Código
Funções como `isQueueIdHistoryBlocked` estão consultando o banco de dados para obter informações que já estão disponíveis no objeto `user` passado como parâmetro.
- **Ação:** Refatorar os serviços para utilizar os dados já carregados em memória.

### 4. Debounce em Eventos de Socket
O sistema emite eventos de socket individualmente para cada micro-atualização.
- **Ação:** Implementar um pequeno delay (debounce) para agrupar atualizações de interface, especialmente na lista de tickets.

---

## 🎨 Melhorias Visuais e de UX (Frontend)

### 1. Virtualização de Listas (Crucial)
A `TicketsListCustom` renderiza todos os itens de uma vez. Quando o sistema tem muitos tickets, isso causa lentidão no navegador.
- **Ação:** Implementar `react-window` ou `react-virtualized` na lista de tickets e na lista de mensagens.
- **Impacto:** Interface fluida mesmo com 10.000+ tickets carregados.

### 2. Otimização de Re-renders
Muchos componentes do frontend re-renderizam desnecessariamente.
- **Ação:** Utilizar `React.memo` em componentes de itens de lista (`TicketListItemCustom`) e `useMemo`/`useCallback` nos hooks de dragging.

### 3. Refinate Aesthetic (Design Premium)
A interface atual utiliza Material UI padrão. Podemos elevar o nível com:
- **Efeito Glassmorphism** mais acentuado no sidebar.
- **Transições suaves** entre estados de tickets.
- **Modo Escuro (Dark Mode)** otimizado com cores HSL equilibradas.

---

## 🛠️ Próximos Passos
1. **Aplicar índices no Banco de Dados** (Baixo risco, alto ganho).
2. **Implementar Cache de Sessões** (Médio risco, maior ganho de CPU).
3. **Virtualização da Lista de Tickets** (Melhoria visível de UX).
