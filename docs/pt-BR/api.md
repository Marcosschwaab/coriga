# Referência da API

URL Base: `http://localhost:3000/api`

## Moradores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/residents` | Listar todos os moradores |
| GET | `/residents?search=query` | Buscar moradores por nome ou unidade |
| POST | `/residents` | Criar um novo morador |
| GET | `/residents/:id` | Obter um morador específico |
| PATCH | `/residents/:id` | Atualizar um morador |
| DELETE | `/residents/:id` | Desativar um morador |

### Corpo da Requisição - Criar Morador

```json
{
  "name": "string (obrigatório)",
  "unit": "string (obrigatório)",
  "phone": "string (opcional)",
  "email": "string (opcional)"
}
```

## Reservas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/reservations` | Listar todas as reservas |
| GET | `/reservations?month=YYYY-MM` | Filtrar por mês |
| GET | `/reservations?status=confirmed` | Filtrar por status |
| POST | `/reservations` | Criar uma nova reserva |
| GET | `/reservations/:id` | Obter uma reserva específica |
| PATCH | `/reservations/:id` | Atualizar uma reserva |
| POST | `/reservations/:id/cancel` | Cancelar uma reserva |

### Corpo da Requisição - Criar Reserva

```json
{
  "residentId": "number (obrigatório)",
  "date": "string (YYYY-MM-DD, obrigatório)",
  "status": "string (opcional, padrão: confirmed)"
}
```

## Pagamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/payments` | Listar todos os pagamentos |
| GET | `/payments?status=pending` | Filtrar por status |
| GET | `/payments/:id` | Obter um pagamento específico |
| PATCH | `/payments/:id` | Atualizar um pagamento |
| POST | `/payments/:id/record` | Registrar um pagamento |

### Corpo da Requisição - Registrar Pagamento

```json
{
  "amount": "number (obrigatório)",
  "method": "string (obrigatório): cash, pix, credit, debit",
  "date": "string (YYYY-MM-DD, opcional)"
}
```

## Feriados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/holidays` | Listar todos os feriados |
| GET | `/holidays?year=2026` | Filtrar por ano |
| POST | `/holidays` | Criar um novo feriado |
| PATCH | `/holidays/:id` | Atualizar um feriado |
| DELETE | `/holidays/:id` | Excluir um feriado |

### Corpo da Requisição - Criar Feriado

```json
{
  "name": "string (obrigatório)",
  "date": "string (YYYY-MM-DD, obrigatório)",
  "type": "string (obrigatório): national, municipal, community"
}
```

## Configuração de Preços

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/pricing-config` | Obter preços atuais |
| PATCH | `/pricing-config` | Atualizar preços |

### Corpo da Requisição - Atualizar Preços

```json
{
  "weekdayPrice": "number (obrigatório)",
  "weekendPrice": "number (obrigatório)",
  "holidayPrice": "number (obrigatório)"
}
```

## Painel (Dashboard)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/dashboard/stats` | Obter estatísticas do painel |
| GET | `/dashboard/stats?month=YYYY-MM` | Obter estatísticas de um mês específico |

### Exemplo de Resposta

```json
{
  "totalReservations": 10,
  "confirmedReservations": 8,
  "cancelledReservations": 2,
  "totalRevenue": 5000,
  "pendingPayments": 3,
  "upcomingReservations": []
}
```

## Respostas de Erro

Todos os endpoints podem retornar as seguintes respostas de erro:

### 400 Requisição Inválida

```json
{
  "statusCode": 400,
  "message": ["Mensagem de erro de validação"],
  "error": "Bad Request"
}
```

### 404 Não Encontrado

```json
{
  "statusCode": 404,
  "message": "Recurso não encontrado",
  "error": "Not Found"
}
```

### 500 Erro Interno do Servidor

```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error"
}
```
