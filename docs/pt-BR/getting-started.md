# Começando

Este guia ajudará você a configurar e executar o projeto Coriga em sua máquina local.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

- **Node.js 18+** - [Baixe aqui](https://nodejs.org/)
- **npm** - Vem com o Node.js

Verifique sua instalação:
```bash
node --version
npm --version
```

## Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd coriga
```

### 2. Instale as Dependências do Backend

```bash
cd backend
npm install
```

### 3. Instale as Dependências do Frontend

```bash
cd frontend
npm install
```

## Executando a Aplicação

### Inicie o Backend

```bash
cd backend
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

### Inicie o Frontend

Abra um novo terminal e execute:

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Populando o Banco de Dados

Para popular o banco de dados com dados de exemplo para testes:

```bash
cd backend
npm run seed
```

Isso cria:
- 5 moradores de exemplo
- 9 feriados (feriados nacionais brasileiros + aniversário da comunidade)
- 5 reservas de exemplo com pagamentos
- Configuração de preços padrão

## Verificando a Instalação

1. Abra seu navegador e navegue até `http://localhost:5173`
2. Você deve ver o painel do Coriga
3. Se você populou o banco de dados, verá dados de exemplo

## Solução de Problemas

### Porta Já em Uso

Se a porta 3000 ou 5173 já estiver em uso:

- Backend: Edite `backend/src/main.ts` para alterar a porta
- Frontend: Execute `npm run dev -- --port 5174` para usar uma porta diferente

### Problemas com o Banco de Dados

Se encontrar erros de banco de dados:

```bash
# Delete o banco de dados existente e popule novamente
rm backend/data/database.sqlite
cd backend
npm run seed
```
