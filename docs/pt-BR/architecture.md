# Arquitetura do Projeto

## Visão Geral

O Coriga segue uma arquitetura full-stack moderna com uma separação clara entre frontend e backend.

## Arquitetura do Backend

### Framework: NestJS

O backend usa NestJS, um framework progressivo para Node.js construído com TypeScript. Segue um padrão de arquitetura modular.

### Estrutura de Módulos

Cada funcionalidade é organizada como um módulo contendo:

- **Controller**: Manipula requisições e respostas HTTP
- **Service**: Contém a lógica de negócio
- **DTO**: Objetos de Transferência de Dados para validação de requisições
- **Module**: Definição do módulo NestJS

### Banco de Dados

- **SQLite**: Banco de dados leve baseado em arquivo
- **TypeORM**: ORM para operações de banco de dados
- **Entities**: Definições de entidades TypeORM em `src/entities/`

### Fluxo de Dados

```
Requisição HTTP → Controller → Service → Repository → Banco de Dados
                                       ↓
Resposta HTTP ← Controller ← Service ← Entity
```

## Arquitetura do Frontend

### Framework: React + Vite

O frontend usa React para componentes de UI e Vite para desenvolvimento e build rápidos.

### Estrutura de Componentes

- **Pages**: Componentes de rota de nível superior
- **Components**: Componentes de UI reutilizáveis
- **Services**: Camada de comunicação com API
- **Types**: Definições de tipos TypeScript
- **Styles**: Estilos globais e específicos de componentes

### Gerenciamento de Estado

- Hooks React para estado local
- Serviço de API para estado do servidor
- Parâmetros de URL para filtros e navegação

## Comunicação

### Padrão de API

- Design de API RESTful
- Formato de requisição/resposta JSON
- Códigos de status HTTP padrão
- Validação de entrada com class-validator

### CORS

O backend está configurado para aceitar requisições do servidor de desenvolvimento do frontend.

## Considerações de Segurança

- Validação de entrada em todos os endpoints
- Queries parametrizadas via TypeORM
- Configuração CORS para origens permitidas
