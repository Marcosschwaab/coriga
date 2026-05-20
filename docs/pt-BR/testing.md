# Guia de Testes

Este guia cobre os testes do backend e frontend do projeto Coriga.

## Testes E2E do Backend

### Executando os Testes

```bash
cd backend
npm run test:e2e
```

### Cobertura dos Testes

| Módulo | Testes |
|--------|--------|
| Moradores | Operações CRUD, funcionalidade de busca, validação de entrada |
| Reservas | Operações CRUD, filtro por data, cancelamento, cálculo automático de preço |
| Pagamentos | Registro de pagamentos, atualização de status, pagamentos parciais |
| Feriados | Operações CRUD, filtro por ano |
| Configuração de Preços | Obter e atualizar configuração de preços |
| Painel | Cálculo de estatísticas |

### Executando Testes Específicos

```bash
# Executar testes para um módulo específico
npm run test:e2e -- residents
npm run test:e2e -- reservations
npm run test:e2e -- payments
```

### Configuração dos Testes

Os testes usam um banco de dados de teste separado para evitar afetar os dados de desenvolvimento. A configuração está em `jest-e2e.json`.

## Testes E2E do Frontend

### Executando os Testes

```bash
cd frontend
npm run test:e2e
```

### Cobertura dos Testes

| Página | Testes |
|--------|--------|
| Navegação | Links da barra lateral, estados ativos, menu mobile |
| Painel | Cards de estatísticas, visão geral de receita, próximas reservas |
| Calendário | Navegação por mês, grade de dias, filtro de status, legenda, modais |
| Moradores | Exibição da tabela, busca, modais de adicionar/editar, badges de status |
| Reservas | Exibição da tabela, filtros, modal de nova reserva, exportação CSV |
| Pagamentos | Cards de estatísticas, exibição da tabela, badges de status |
| Feriados | Exibição da tabela, filtro por ano, modais de adicionar/editar, badges de tipo |
| Preços | Campos de preço, botão de salvar |

### Executando Testes Específicos

```bash
# Executar testes com interface do Playwright
npm run test:e2e -- --ui

# Executar testes em modo headed
npm run test:e2e -- --headed
```

### Configuração dos Testes

Os testes do frontend usam Playwright. A configuração está em `playwright.config.ts`.

## Escrevendo Testes

### Testes do Backend

Os testes do backend estão localizados em `backend/test/`. Use os utilitários de teste do NestJS:

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ResidentsService', () => {
  let service: ResidentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidentsService],
    }).compile();

    service = module.get<ResidentsService>(ResidentsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
});
```

### Testes do Frontend

Os testes do frontend estão localizados em `frontend/e2e/`. Use Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('deve exibir o painel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```
