# API Reference

Base URL: `http://localhost:3000/api`

## Residents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/residents` | List all residents |
| GET | `/residents?search=query` | Search residents by name or unit |
| POST | `/residents` | Create a new resident |
| GET | `/residents/:id` | Get a specific resident |
| PATCH | `/residents/:id` | Update a resident |
| DELETE | `/residents/:id` | Deactivate a resident |

### Create Resident Request Body

```json
{
  "name": "string (required)",
  "unit": "string (required)",
  "phone": "string (optional)",
  "email": "string (optional)"
}
```

## Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reservations` | List all reservations |
| GET | `/reservations?month=YYYY-MM` | Filter by month |
| GET | `/reservations?status=confirmed` | Filter by status |
| POST | `/reservations` | Create a new reservation |
| GET | `/reservations/:id` | Get a specific reservation |
| PATCH | `/reservations/:id` | Update a reservation |
| POST | `/reservations/:id/cancel` | Cancel a reservation |

### Create Reservation Request Body

```json
{
  "residentId": "number (required)",
  "date": "string (YYYY-MM-DD, required)",
  "status": "string (optional, default: confirmed)"
}
```

## Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List all payments |
| GET | `/payments?status=pending` | Filter by status |
| GET | `/payments/:id` | Get a specific payment |
| PATCH | `/payments/:id` | Update a payment |
| POST | `/payments/:id/record` | Record a payment |

### Record Payment Request Body

```json
{
  "amount": "number (required)",
  "method": "string (required): cash, pix, credit, debit",
  "date": "string (YYYY-MM-DD, optional)"
}
```

## Holidays

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/holidays` | List all holidays |
| GET | `/holidays?year=2026` | Filter by year |
| POST | `/holidays` | Create a new holiday |
| PATCH | `/holidays/:id` | Update a holiday |
| DELETE | `/holidays/:id` | Delete a holiday |

### Create Holiday Request Body

```json
{
  "name": "string (required)",
  "date": "string (YYYY-MM-DD, required)",
  "type": "string (required): national, municipal, community"
}
```

## Pricing Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pricing-config` | Get current pricing |
| PATCH | `/pricing-config` | Update pricing |

### Update Pricing Request Body

```json
{
  "weekdayPrice": "number (required)",
  "weekendPrice": "number (required)",
  "holidayPrice": "number (required)"
}
```

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |
| GET | `/dashboard/stats?month=YYYY-MM` | Get statistics for specific month |

### Response Example

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

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["Validation error message"],
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
