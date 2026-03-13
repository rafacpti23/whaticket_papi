# Portainer / Docker Swarm

Arquivos disponiveis:

- `deploy/portainer/swarm-stack.yml`
- `deploy/portainer/swarm-images.yml`

## Recomendacao

Use `swarm-images.yml`.

Essa versao e a mais estavel para producao porque o Portainer sobe imagens prontas do Docker Hub, sem precisar clonar repositorio nem compilar aplicacao dentro do container.

Imagens publicadas:

- `ramel/whaticket_papi-backend:codex-v11`
- `ramel/whaticket_papi-frontend:codex-v11`

## O que a stack sobe

- `postgres`
- `redis`
- `backend`
- `frontend`

## Stack por imagens

Arquivo:

- `deploy/portainer/swarm-images.yml`

Caracteristicas:

- usa imagens prontas publicadas no Docker Hub
- backend roda `sequelize db:migrate` antes de iniciar
- usa volumes persistentes para banco, redis e arquivos da aplicacao
- nao depende de `git clone` no startup

Fluxo recomendado no Portainer:

1. Crie uma stack em modo `Swarm`.
2. Cole o conteudo de `deploy/portainer/swarm-images.yml`.
3. Ajuste pelo menos:

- `BACKEND_URL`
- `FRONTEND_URL`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MASTER_KEY`

4. Faça o deploy.

## Stack por clone do Git

Arquivo:

- `deploy/portainer/swarm-stack.yml`

Caracteristicas:

- clona o repositorio no startup
- instala dependencias e compila dentro do container
- util para testes, mas mais lenta e mais fragil para producao

## Observacoes

- o projeto esta configurado para `1 replica` de backend e frontend
- o backend depende de Postgres e Redis antes de iniciar
- se o banco estiver vazio, as migrations criam as tabelas automaticamente
- se quiser usuarios iniciais e dados padrao, rode seeds manualmente ou adapte a stack para isso
- se atualizar a imagem no Docker Hub mantendo a mesma tag, faca redeploy forcando pull da imagem nova no Portainer
