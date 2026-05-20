# Coriga - Party Room Reservation System

A complete web system for managing party room reservations in condominiums.

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed JavaScript
- **SQLite** - Lightweight database
- **TypeORM** - ORM for TypeScript

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TypeScript** - Typed JavaScript
- **TailwindCSS** - Utility-first CSS framework

## Features

- **Dashboard**: Monthly statistics, upcoming reservations, revenue overview
- **Interactive Calendar**: Monthly view with color-coded reservations, holidays, and payment status
- **Resident Management**: Full CRUD with search, active/inactive status
- **Reservation Management**: Create, edit, cancel reservations with automatic pricing
- **Payment Control**: Track payments, record partial payments, payment methods
- **Pricing Configuration**: Set different prices for weekdays, weekends, and holidays
- **Holiday Management**: Register holidays with automatic pricing application
- **CSV Export**: Export reservations to CSV

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run start:dev
```
The API will be available at `http://localhost:3000`

2. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

### Seeding the Database

To populate the database with sample data:
```bash
cd backend
npm run seed
```

This creates:
- 5 sample residents
- 9 holidays (Brazilian national holidays + community anniversary)
- 5 sample reservations with payments
- Default pricing configuration

## Project Structure

```
coriga/
├── backend/
│   ├── src/
│   │   ├── entities/           # TypeORM entities
│   │   ├── dtos/               # Data transfer objects with validation
│   │   ├── modules/            # NestJS modules
│   │   │   ├── residents/
│   │   │   ├── reservations/
│   │   │   ├── payments/
│   │   │   ├── holidays/
│   │   │   ├── pricing-config/
│   │   │   └── dashboard/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── seed.ts
│   ├── data/                   # SQLite database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service
│   │   ├── types/              # TypeScript types
│   │   ├── styles/             # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Business Rules

- Each date can only have one reservation
- Inactive residents cannot make new reservations
- Reservation price is automatically calculated based on day type (weekday/weekend/holiday)
- Holidays override weekend pricing
- Payment status is automatically updated based on paid amount
- Deactivating a resident preserves their reservation history

## Testing

### Backend E2E Tests

Run all backend E2E tests:
```bash
cd backend
npm run test:e2e
```

Backend test coverage:
- Residents module: CRUD operations, search, validation
- Reservations module: CRUD operations, date filtering, cancellation, auto-pricing
- Payments module: Payment recording, status updates, partial payments
- Holidays module: CRUD operations, year filtering
- Pricing Config module: Get and update pricing
- Dashboard module: Statistics calculation

### Frontend E2E Tests

Run all frontend E2E tests:
```bash
cd frontend
npm run test:e2e
```

Frontend test coverage:
- Navigation: All sidebar links, active states, mobile menu
- Dashboard: Stat cards, revenue overview, upcoming reservations
- Calendar: Month navigation, day grid, status filter, legend, modals
- Residents: Table, search, add/edit modals, status badges
- Reservations: Table, filters, new reservation modal, CSV export
- Payments: Stat cards, table, status badges
- Holidays: Table, year filter, add/edit modals, type badges
- Pricing: Price fields, save button
