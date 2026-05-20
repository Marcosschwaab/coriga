# Project Architecture

## Overview

Coriga follows a modern full-stack architecture with a clear separation between frontend and backend.

## Backend Architecture

### Framework: NestJS

The backend uses NestJS, a progressive Node.js framework built with TypeScript. It follows a modular architecture pattern.

### Module Structure

Each feature is organized as a module containing:

- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic
- **DTO**: Data Transfer Objects for request validation
- **Module**: NestJS module definition

### Database

- **SQLite**: Lightweight file-based database
- **TypeORM**: ORM for database operations
- **Entities**: TypeORM entity definitions in `src/entities/`

### Data Flow

```
HTTP Request → Controller → Service → Repository → Database
                                    ↓
HTTP Response ← Controller ← Service ← Entity
```

## Frontend Architecture

### Framework: React + Vite

The frontend uses React for UI components and Vite for fast development and building.

### Component Structure

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Services**: API communication layer
- **Types**: TypeScript type definitions
- **Styles**: Global and component-specific styles

### State Management

- React hooks for local state
- API service for server state
- URL parameters for filters and navigation

## Communication

### API Pattern

- RESTful API design
- JSON request/response format
- Standard HTTP status codes
- Input validation with class-validator

### CORS

The backend is configured to accept requests from the frontend development server.

## Security Considerations

- Input validation on all endpoints
- Parameterized queries via TypeORM
- CORS configuration for allowed origins
