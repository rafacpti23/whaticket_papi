# 🔧 Revisão de Erros por Página — Whaticket Frontend

## Padrões de Erro a Procurar
- `user.queues` sem `|| []`
- `user.company` sem `?.`
- `data.xxx` sem `?.` após chamadas API
- `.length` / `.map` / `.filter` / `.find` sem proteção
- `[...array]` spread sem verificar se é array
- `user.profile`, `user.id`, `user.companyId` acessados antes do login

## Páginas — Status

| Rota | Componente | Status | Erros Encontrados |
|------|-----------|--------|-------------------|
| `/` | Dashboard | ✅ Sem crash | — |
| `/tickets` | TicketResponsiveContainer → TicketsCustom | ✅ Corrigido | `NewTicketModal:92 user.queues.length`, `ListTicketsService:80 backend 500` |
| `/connections` | Connections | ✅ Corrigido | `user.company.dueDate` sem proteção |
| `/login` | Login | ✅ OK | — |
| `/signup` | Signup | 🔍 A verificar | unused vars (warnings only) |
| `/financeiro` | Financeiro | 🔍 A verificar | — |
| `/companies` | Companies | 🔍 A verificar | — |
| `/quick-messages` | QuickMessages | 🔍 A verificar | — |
| `/todolist` | ToDoList | 🔍 A verificar | — |
| `/schedules` | Schedules | 🔍 A verificar | — |
| `/tags` | Tags | 🔍 A verificar | — |
| `/contacts` | Contacts | 🔍 A verificar | — |
| `/helps` | Helps | 🔍 A verificar | — |
| `/users` | Users | 🔍 A verificar | — |
| `/messages-api` | MessagesAPI | 🔍 A verificar | — |
| `/settings` | SettingsCustom | 🔍 A verificar | — |
| `/queues` | Queues | 🔍 A verificar | — |
| `/reports` | Reports | 🔍 A verificar | `data.tickets.length` sem proteção (linha 237) |
| `/queue-integration` | QueueIntegration | 🔍 A verificar | — |
| `/announcements` | Annoucements | 🔍 A verificar | — |
| `/phrase-lists` | CampaignsPhrase | 🔍 A verificar | — |
| `/flowbuilders` | FlowBuilder | 🔍 A verificar | — |
| `/chats` | Chat | 🔍 A verificar | — |
| `/files` | Files | 🔍 A verificar | — |
| `/moments` | ChatMoments/Moments | 🔍 A verificar | — |
| `/Kanban` | Kanban | ✅ Corrigido | `user.queues` sem proteção |
| `/TagsKanban` | TagsKanban | 🔍 A verificar | — |
| `/prompts` | Prompts | 🔍 A verificar | — |
| `/allConnections` | AllConnections | 🔍 A verificar | — |
| `/subscription` | Subscription | 🔍 A verificar | — |

## Componentes Globais (todo layout)
| Componente | Status |
|-----------|--------|
| MainListItems | ✅ Corrigido |
| NotificationsPopOver | ✅ Corrigido |
| TicketsManagerTabs | ✅ Corrigido |
| MomentsUser | ✅ Corrigido |
| useAuth | ✅ Corrigido |
| useTickets | ✅ Corrigido |
| useWhatsApps | ✅ Corrigido |
| NewTicketModal | ✅ Corrigido |
