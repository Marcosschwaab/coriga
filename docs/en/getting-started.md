# Getting Started

This guide will help you set up and run the Coriga project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js

Verify your installation:
```bash
node --version
npm --version
```

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coriga
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Start the Frontend

Open a new terminal and run:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Seeding the Database

To populate the database with sample data for testing:

```bash
cd backend
npm run seed
```

This creates:
- 5 sample residents
- 9 holidays (Brazilian national holidays + community anniversary)
- 5 sample reservations with payments
- Default pricing configuration

## Verifying the Installation

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Coriga dashboard
3. If you seeded the database, you'll see sample data

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

- Backend: Edit `backend/src/main.ts` to change the port
- Frontend: Run `npm run dev -- --port 5174` to use a different port

### Database Issues

If you encounter database errors:

```bash
# Delete the existing database and re-seed
rm backend/data/database.sqlite
cd backend
npm run seed
```
