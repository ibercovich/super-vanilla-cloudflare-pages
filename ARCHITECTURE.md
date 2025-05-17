# Super Vanilla Cloudflare Pages Architecture

This document describes the architecture of the Super Vanilla Cloudflare Pages project, a simple CMS built on Cloudflare Pages with Cloudflare Functions and D1 Database.

## Overview

The application is a lightweight CMS (Content Management System) that uses Cloudflare Pages for hosting, Cloudflare Functions for serverless backend functionality, and Cloudflare D1 (SQLite) for data storage. It follows a "super vanilla" approach, meaning it prioritizes simplicity and minimal dependencies over complex frameworks.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/HTMX/JS with Mustache templates
- **Backend**: Cloudflare Functions (powered by Cloudflare Workers)
- **Database**: Cloudflare D1 (distributed SQLite database)
- **Build System**: Custom configuration with optional ESBuild bundling
- **Authentication**: Custom session-based auth with secure cookie management
- **Styling**: Bulma CSS framework (referenced in templates)

## Repository Structure

The repository is organized into several key directories:

- **`functions/`**: Source code for serverless functions, used for development
  - **`functions/src/`**: Shared utilities and core functionality
  - **`functions/src/templates/`**: Mustache HTML templates
  - **`functions/api/`**: API endpoints
  - **`functions/auth/`**: Authentication handlers
  - **`functions/contacts/`**: Contact management functionality
- **`pages/`**: Static assets and files for the frontend
- Other configuration files:
  - **`wrangler.toml`**: Cloudflare configuration
  - **`schema.sql`**: Database schema definitions
  - **`build.js`**: Custom build process
  - **`package.json`**: Project dependencies and scripts

## Build Process

The build process is defined in `build.js` and supports two deployment modes:

### Simple Build (NO_BUILD mode)

1. Generating timestamp file for client-side cache busting
2. Generating a module that imports all templates with relative paths

## Module Loading

The application supports two approaches for loading modules:

### Without Bundling (Direct Copy)

When using the direct copy approach, all imports use explicit relative paths:

```javascript
import { renderTemplate } from '../src/utils.js';
import * as T from '../src/templates/.gen.js';
```

The template generation process (`bulkImports`) adjusts imported paths based on the approach being used.

## Application Architecture

### Database

The application uses Cloudflare D1, a distributed SQLite database. The schema is defined in `schema.sql` and includes tables for:

- **`users`**: User accounts with email, password, and name
- **`users_sessions`**: Session management with tokens and expiration times
- **`contacts`**: Contact information (demonstrating basic CRUD operations)

### Backend

The backend is built using Cloudflare Functions, which are serverless functions that run on the Cloudflare edge network. These functions are organized by feature:

- **`api/`**: API endpoints for data access
- **`auth/`**: Authentication flow (login, register, logout)
- **`contacts/`**: Contact management (CRUD operations)

The application uses a custom routing system implemented in `utils.js` that matches URL patterns to handler functions.

### Database Access

Database access is abstracted through the `DBService` class in `db.js`, which provides methods for common operations:

- **`runQuery`**: Execute a parameterized SQL query
- **`insertOne`**: Insert a single record
- **`updateOne`**: Update a single record
- **`queryAll`**: Query records with optional conditions
- **`deleteById`**: Delete a record by ID

### Authentication

The application implements a custom session-based authentication system:

1. User credentials are validated against the database
2. Session tokens are generated and stored in the `users_sessions` table
3. Tokens are set as secure, HTTP-only cookies
4. Sessions have expiration timestamps
5. Protected routes check for valid sessions before allowing access

### Templating

The application uses Mustache for HTML templating:

1. Templates are stored in the `functions/src/templates/` directory as HTML files
2. The build process generates a module that imports all templates
3. The `renderTemplate` function in `utils.js` combines templates with data
4. Partials (like header and footer) are reused across pages

### Routing

The application uses URL pattern matching for routing:

1. Routes are defined as objects with a pattern, handler function, and optional protection flag
2. The `routey` function in `utils.js` matches the request path to a handler
3. Protected routes check for authentication before executing

## Development Workflow

The development workflow is defined in `package.json` scripts:

1. **`build`**: Compiles the application
2. **`deploy`**: Compiles and deploys the application to production
3. **`dev`**: Runs a local development server with hot reloading

The development server uses Nodemon to watch for changes and automatically rebuild.

## Secrets and Environment Variables

Environment variables like `SALT_TOKEN` can be set in different ways:

1. In development: Via the `--binding` parameter when running wrangler
2. In package.json scripts: By setting variables like `SALT_TOKEN=SALT_TOKEN_STRING` in the script
3. In production: Using Cloudflare Dashboard or wrangler secrets

## Deployment

The application is deployed to Cloudflare Pages, which hosts the static assets and serverless functions. The deployment is configured through `wrangler.toml`.

## Security Considerations

The application implements several security features:

1. Passwords are hashed using SHA-256 with a salt
2. Session tokens are stored securely in HTTP-only cookies
3. Protected routes verify authentication before granting access
4. Form inputs are validated before processing
5. Sensitive configuration like `SALT_TOKEN` is managed through environment variables/secrets

## Conclusion

This architecture represents a minimalist, "vanilla" approach to building a web application on Cloudflare's stack. By avoiding heavy frameworks and keeping dependencies light, the application maintains simplicity while still providing essential features like authentication, database access, and templating.
