# Coriga - Sistema de Reserva de Salão de Festas

Um sistema web completo para gerenciamento de reservas de salão de festas em condomínios.

## Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução
- **NestJS** - Framework progressivo para Node.js
- **TypeScript** - JavaScript tipado
- **SQLite** - Banco de dados leve
- **TypeORM** - ORM para TypeScript

### Frontend
- **React** - Biblioteca de interface
- **Vite** - Ferramenta de build
- **TypeScript** - JavaScript tipado
- **TailwindCSS** - Framework CSS utility-first

## Funcionalidades

- **Painel (Dashboard)**: Estatísticas mensais, próximas reservas, visão geral de receita
- **Calendário Interativo**: Visão mensal com reservas coloridas, feriados e status de pagamento
- **Gerenciamento de Moradores**: CRUD completo com busca, status ativo/inativo
- **Gerenciamento de Reservas**: Criar, editar, cancelar reservas com cálculo automático de preço
- **Controle de Pagamentos**: Acompanhar pagamentos, registrar pagamentos parciais, métodos de pagamento
- **Configuração de Preços**: Definir preços diferentes para dias úteis, finais de semana e feriados
- **Gerenciamento de Feriados**: Cadastrar feriados com aplicação automática de preços
- **Exportação CSV**: Exportar reservas para CSV

## Começando

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

1. Clone o repositório

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

### Executando a Aplicação

1. Inicie o servidor backend:
```bash
cd backend
npm run start:dev
```
A API estará disponível em `http://localhost:3000`

2. Inicie o servidor de desenvolvimento do frontend (em um novo terminal):
```bash
cd frontend
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`

### Populando o Banco de Dados

Para popular o banco de dados com dados de exemplo:
```bash
cd backend
npm run seed
```

Isso cria:
- 5 moradores de exemplo
- 9 feriados (feriados nacionais brasileiros + aniversário da comunidade)
- 5 reservas de exemplo com pagamentos
- Configuração de preços padrão

## Estrutura do Projeto

```
coriga/
├── backend/
│   ├── src/
│   │   ├── entities/           # Entidades TypeORM
│   │   ├── dtos/               # Objetos de transferência de dados com validação
│   │   ├── modules/            # Módulos NestJS
│   │   │   ├── residents/
│   │   │   ├── reservations/
│   │   │   ├── payments/
│   │   │   ├── holidays/
│   │   │   ├── pricing-config/
│   │   │   └── dashboard/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── seed.ts
│   ├── data/                   # Banco de dados SQLite
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Componentes de página
│   │   ├── services/           # Serviço de API
│   │   ├── types/              # Tipos TypeScript
│   │   ├── styles/             # Estilos globais
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Regras de Negócio

- Cada data pode ter apenas uma reserva
- Moradores inativos não podem fazer novas reservas
- O preço da reserva é calculado automaticamente com base no tipo do dia (dia útil/final de semana/feriado)
- Feriados sobrescrevem o preço de final de semana
- O status do pagamento é atualizado automaticamente com base no valor pago
- Desativar um morador preserva seu histórico de reservas

## Testes

### Testes E2E do Backend

Execute todos os testes E2E do backend:
```bash
cd backend
npm run test:e2e
```

Cobertura dos testes do backend:
- Módulo de moradores: operações CRUD, busca, validação
- Módulo de reservas: operações CRUD, filtro por data, cancelamento, cálculo automático de preço
- Módulo de pagamentos: registro de pagamentos, atualização de status, pagamentos parciais
- Módulo de feriados: operações CRUD, filtro por ano
- Módulo de configuração de preços: obter e atualizar preços
- Módulo de painel: cálculo de estatísticas

### Testes E2E do Frontend

Execute todos os testes E2E do frontend:
```bash
cd frontend
npm run test:e2e
```

Cobertura dos testes do frontend:
- Navegação: Todos os links da barra lateral, estados ativos, menu mobile
- Painel: Cards de estatísticas, visão geral de receita, próximas reservas
- Calendário: Navegação por mês, grade de dias, filtro de status, legenda, modais
- Moradores: Tabela, busca, modais de adicionar/editar, badges de status
- Reservas: Tabela, filtros, modal de nova reserva, exportação CSV
- Pagamentos: Cards de estatísticas, tabela, badges de status
- Feriados: Tabela, filtro por ano, modais de adicionar/editar, badges de tipo
- Preços: Campos de preço, botão de salvar
