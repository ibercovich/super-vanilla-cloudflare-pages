# Super Vanilla Cloudflare Pages Project Documentation

## 1. Overview

This document provides a comprehensive overview of the "Super Vanilla" Cloudflare Pages project. It's designed as a simple Content Management System (CMS) or a foundational application demonstrating common web application patterns on the Cloudflare serverless platform.

The project utilizes Cloudflare Pages for hosting static assets and serverless functions, Cloudflare D1 for its database, and a custom-built, lightweight framework for routing, templating, and authentication. The emphasis is on minimizing external dependencies and providing a clear, understandable architecture.

**Key Technologies:**

- Cloudflare Pages (Static hosting & Functions)
- Cloudflare D1 (Serverless SQL Database)
- JavaScript (ES Modules)
- Node.js (for the build script and development environment)
- Mustache.js (Templating)
- htmx (for enhanced HTML interactions)
- Bulma (CSS Framework)
- Font Awesome (Icons)

**Source Files Referenced:**

- `package.json` (for project metadata and dependencies)
- `wrangler.toml` (for Cloudflare configuration)

## 2. Architecture

The project follows a modern web architecture pattern, separating concerns into frontend, backend (serverless functions), templating, database interaction, and authentication.

### 2.1. Frontend

The frontend consists of static assets and client-side JavaScript for enhancing user experience.

- **Static Assets**: Served from the `pages/` directory, as configured in `wrangler.toml` (`pages_build_output_dir = "pages"`). This includes:
  - Images (e.g., `pages/super-vanilla.png`)
  - Custom error pages (e.g., `pages/404.html`)
  - Client-side utility scripts (e.g., `pages/dev-refresh.js`)
- **Styling**: Uses [Bulma CSS](https://bulma.io/) and [Font Awesome](https://fontawesome.com/) for icons, linked via CDNs in the main layout template (`functions/src/templates/index.html`).
- **Dynamic Interactions**: Leverages [htmx](https://htmx.org/) to enable AJAX-driven updates and dynamic content loading without full page reloads. htmx is included in `functions/src/templates/index.html`.
- **Development Live Reload**: The `pages/dev-refresh.js` script provides a live-reloading feature during local development by polling `pages/buildts.gen.json`.

**Source Files Referenced:**

- `wrangler.toml` (line: `pages_build_output_dir = "pages"`)
- `functions/src/templates/index.html` (lines: Bulma, Font Awesome, htmx, dev-refresh script inclusion)
- `pages/dev-refresh.js` (lines: 1-28, polling logic)
- `build.js` (line: `fs.writeFileSync(path.join(CONF.static, CONF.buildts), ...)` for `buildts.gen.json`)

### 2.2. Backend (Cloudflare Functions)

Server-side logic is handled by Cloudflare Functions located within the `functions/` directory.

- **File-based Routing (Cloudflare Pages)**: Cloudflare Pages uses the directory structure within `functions/` to determine routes. For example:
  - `functions/contacts/[[contacts]].js` handles all requests under the `/contacts/*` path.
  - `functions/auth/[[auth]].js` handles all requests under the `/auth/*` path.
- **Custom Internal Router**: Inside these catch-all function files, a custom router implemented in `functions/src/utils.js` (`routey` function) further dispatches requests based on HTTP method and a more specific URL pattern.
  - Uses `url-pattern` library to define and match routes (e.g., `new UrlPattern('GET/contacts/:id')`).
  - Route definitions are found in files like `functions/contacts/[[contacts]].js` and `functions/auth/[[auth]].js`.

**Source Files Referenced:**

- `functions/contacts/[[contacts]].js` (filename and route definitions array)
- `functions/auth/[[auth]].js` (filename and route definitions array)
- `functions/src/utils.js` (lines: `routey` function implementation)
- `package.json` (dependency: `"url-pattern": "^1.0.3"`)

### 2.3. Templating System

The project employs a server-side templating system using Mustache.js, facilitated by a custom build process.

- **`build.js` Script**:
  - This Node.js script (`build.js`) is central to the templating setup.
  - It scans the `functions/src/templates/` directory for `.html` files.
  - It generates `functions/src/templates/.gen.js`, which exports all found HTML templates as JavaScript string modules. This allows templates to be imported directly into function code (e.g., `import * as T from '../src/templates/.gen.js';`).
  - It also creates `pages/buildts.gen.json` with the current timestamp, used by `dev-refresh.js` for live reloading.
- **Mustache.js**:
  - Used as the templating engine for rendering HTML.
  - Imported in `functions/src/utils.js`.
- **Base Layout**:
  - `functions/src/templates/index.html` serves as the main site layout. It includes placeholders for dynamic content like `{{ title }}`, `{{> header}}`, `{{> content}}`, and `{{> footer}}`.
- **Page-Specific Templates & Partials**:
  - Individual page structures (e.g., `contacts.html`, `login.html`) are defined in `functions/src/templates/`.
  - These are rendered and injected into the `{{> content}}` placeholder of the base layout.
  - Common reusable components like `header.html` and `footer.html` are located in `functions/src/templates/` and used as partials (`{{> header}}`, `{{> footer}}`).
  - Smaller partials like `controls.html` (in `functions/src/templates/partials/`) are also used.
- **Rendering Logic**:
  - The `renderTemplate` function in `functions/src/utils.js` orchestrates the rendering process, taking data and partials, and using `Mustache.render`. It automatically includes `header` and `footer` partials.

**Source Files Referenced:**

- `build.js` (lines: `bulkImports` function, `getAll` function, writing `.gen.js` and `buildts.gen.json`)
- `functions/src/templates/.gen.js` (example of generated output)
- `functions/src/utils.js` (lines: `import Mustache`, `renderTemplate` function)
- `functions/src/templates/index.html` (lines: Mustache placeholders like `{{> content}}`)
- `functions/contacts/[[contacts]].js` (lines: `allContacts` function shows how `partials.content = T.contacts` is set)
- `package.json` (dependency: `"mustache": "^4.2.0"`)

### 2.4. Database (Cloudflare D1)

Persistence is handled by Cloudflare D1, a serverless SQL database.

- **`DBService` Class**:
  - Located in `functions/src/db.js`.
  - Provides an abstraction layer for database operations (CRUD).
  - Methods include `runQuery`, `insertOne`, `updateOne`, `queryAll`, `deleteById`.
  - Uses parameterized queries to prevent SQL injection.
  - The D1 database instance is passed to its constructor from `context.env.DB`, which is configured in `wrangler.toml`.
- **Schema**:
  - Defined in `schema.sql`.
  - Includes tables for `users`, `users_sessions`, and `contacts`.
  - Contains sample data for the `contacts` table.

**Source Files Referenced:**

- `functions/src/db.js` (lines: `DBService` class implementation)
- `wrangler.toml` (lines: `[[d1_databases]]` binding `DB`)
- `schema.sql` (lines: `CREATE TABLE` statements)
- `functions/contacts/[[contacts]].js` (lines: `const DB = new DBService(context.env.DB);`)

### 2.5. Authentication

Custom authentication is implemented using a session-based approach.

- **Session Management**:
  - Uses HTTP-only, Secure, SameSite=Strict cookies to store a `session_token`.
  - Session details (user ID, hashed token, expiration) are stored in the `users_sessions` D1 table.
- **Password & Token Hashing**:
  - The `hashPassword(password, salt)` function in `functions/auth/[[auth]].js` uses `crypto.subtle.digest` (SHA-256) to hash passwords and session tokens.
  - It uses a global salt string retrieved from `context.env.SALT_TOKEN` (configured via `wrangler.toml` or environment variables).
- **Authentication Flow**:
  - **Registration**: `POST /auth/register` (in `functions/auth/[[auth]].js`) hashes the password and creates a new user in the `users` table.
  - **Login**: `POST /auth/login` (in `functions/auth/[[auth]].js`) verifies credentials, generates a session token, stores it in `users_sessions`, and sets the `session_token` cookie.
  - **Logout**: `GET /auth/logout` (in `functions/auth/[[auth]].js`) invalidates the session in the database and clears the cookie.
  - **Verification**: The `isAuthenticated(context)` function in `functions/src/utils.js` checks the validity of the `session_token` cookie against the `users_sessions` table.
- **Protected Routes**:
  - The `routey` router in `functions/src/utils.js` checks a `protected: true` flag on route definitions and uses `isAuthenticated` to restrict access.

**Source Files Referenced:**

- `functions/auth/[[auth]].js` (lines: `login`, `register`, `logout`, `hashPassword` functions)
- `functions/src/utils.js` (lines: `isAuthenticated` function, `routey` function's protection logic)
- `schema.sql` (lines: `users` and `users_sessions` table definitions)
- `wrangler.toml` (comments regarding `SALT_TOKEN`)

### 2.6. Core Utilities (`functions/src/utils.js`)

The `functions/src/utils.js` file contains essential helper functions used throughout the backend:

- **`renderTemplate` & `render404`**: Handle HTML page rendering using Mustache.
- **`readRequestBody`**: Parses incoming request bodies (JSON, form data, text).
- **`isAuthenticated`**: Checks user authentication status.
- **`routey`**: The custom request router.
- **`html` & `escapeHTML`**: A template literal tag for safely constructing HTML strings with basic XSS protection.

**Source Files Referenced:**

- `functions/src/utils.js` (entire file)

## 3. Project Structure

```
.
├── build.js                 # Custom build script for templating and timestamp generation
├── functions/               # Serverless functions (backend)
│   ├── auth/
│   │   └── [[auth]].js      # Handles /auth/* routes (login, register, logout)
│   ├── contacts/
│   │   └── [[contacts]].js  # Handles /contacts/* routes (CRUD for contacts)
│   ├── index.js             # Example root function (can be expanded or removed)
│   └── src/
│       ├── db.js            # DBService class for D1 interactions
│       ├── schemas/         # (Potentially for data validation schemas - currently empty or not fully utilized)
│       ├── templates/
│       │   ├── .gen.js      # Auto-generated: exports all HTML templates as modules
│       │   ├── contacts.html  # Template for contacts list
│       │   ├── footer.html    # Footer partial
│       │   ├── header.html    # Header partial
│       │   ├── index.html     # Base layout template
│       │   ├── login.html     # Template for login/registration form
│       │   ├── new_contact.html # Template for creating/editing contacts
│       │   ├── view_contact.html# Template for viewing a single contact
│       │   └── partials/
│       │       └── controls.html # Example partial for UI controls
│       └── utils.js         # Core utility functions (routing, rendering, auth check)
├── package.json             # Project metadata, dependencies, and scripts
├── pages/                   # Static assets served by Cloudflare Pages
│   ├── 404.html             # Custom 404 page
│   ├── buildts.gen.json     # Auto-generated: timestamp for dev refresh
│   ├── dev-refresh.js       # Client-side script for live reload in dev
│   └── super-vanilla.png    # Example static image asset
├── schema.sql               # D1 database schema and sample data
├── wrangler.toml            # Cloudflare Wrangler configuration
└── README.md                # Project README
└── DOCUMENTATION.md         # This file
```

## 4. Setup and Local Development

### 4.1. Prerequisites

- Node.js (version specified or compatible with project dependencies)
- npm (comes with Node.js)
- Wrangler CLI: `npm install -g wrangler` (or use via `npx`)

### 4.2. Installation

1. Clone the repository.
2. Install dependencies: `npm install`

### 4.3. Environment Variables

- **`SALT_TOKEN`**: This is crucial for security (password and session token hashing).
  - For local development, it can be set directly in the `npm run dev` script command in `package.json` or as an environment variable.
  - The `package.json`'s `dev` script and `nodemonConfig.exec` already include `SALT_TOKEN=SALT_TOKEN_STRING`. **This default value MUST be changed for any real deployment or if security is a concern even in development.**
  - **Example for `nodemonConfig.exec` in `package.json`**:
    ```json
    "exec": "node build.js --production && wrangler pages dev --binding SALT_TOKEN=YOUR_SECURE_RANDOM_STRING"
    ```
  - And for the `dev` script itself:
    ```json
    "dev": "SALT_TOKEN=YOUR_SECURE_RANDOM_STRING NO_BUILD=true nodemon"
    ```

### 4.4. Running the Dev Server

- Execute: `npm run dev`
- This command does the following (as configured in `package.json`'s `nodemonConfig`):
  1. Sets the `SALT_TOKEN` environment variable.
  2. Starts `nodemon`, which watches for file changes in the `functions/` directory (ignoring `.gen.*` files).
  3. On any change (or initial start):
     a. Runs `node build.js --production`: This generates/updates `functions/src/templates/.gen.js` and `pages/buildts.gen.json`.
     b. Starts the Wrangler development server: `wrangler pages dev --binding SALT_TOKEN=...`. This serves the `pages/` directory and runs the functions locally. The `SALT_TOKEN` is explicitly bound here as well to be available to the functions' context.
- The application will typically be available at `http://localhost:8080` (or as specified by Wrangler).
- The `dev-refresh.js` script (if loaded by the main template) will poll `buildts.gen.json` and automatically reload the browser page when `build.js` completes after a file change.

**Source Files Referenced:**

- `package.json` (lines: `scripts.dev`, `nodemonConfig`)
- `wrangler.toml` (lines: `[dev]` port, `SALT_TOKEN` comments)
- `build.js` (as it's run by the dev script)
- `pages/dev-refresh.js` (for live reload behavior)

## 5. Build and Deployment

### 5.1. Build Process

- The primary build command is `npm run build`, which executes `node build.js --production`.
- The `build.js` script performs two main tasks:
  1. **Template Bundling**: Generates `functions/src/templates/.gen.js` by collecting all `.html` files from `functions/src/templates/` and its subdirectories. This makes HTML templates importable as strings in JavaScript modules.
  2. **Timestamp Generation**: Creates `pages/buildts.gen.json` containing the build timestamp, used for cache-busting or the development live-reload mechanism.
- The `--production` flag passed to `build.js` is not actively used within the current `build.js` script logic but could be used for future enhancements (e.g., minification if esbuild were fully integrated).
- The output of the build relevant to static assets is already structured within the `pages/` directory, which is designated as the `pages_build_output_dir` in `wrangler.toml`.

**Source Files Referenced:**

- `package.json` (line: `scripts.build`)
- `build.js` (entire file)
- `wrangler.toml` (line: `pages_build_output_dir = "pages"`)

### 5.2. Deployment to Cloudflare Pages

- Deployment is typically handled by connecting a Git repository to a Cloudflare Pages project.
- **Build Configuration in Cloudflare Pages UI**:
  - **Build command**: `npm run build`
  - **Build output directory**: `pages`
- **Environment Variables & Bindings (Production)**:
  - **`SALT_TOKEN`**: This **MUST** be set as a secret environment variable in the Cloudflare Pages project settings for production. Example: `SALT_TOKEN = "YOUR_VERY_SECURE_PRODUCTION_SALT"`.
  - **D1 Database**: The D1 database binding (e.g., `DB`) needs to be configured in the Cloudflare Pages project settings, linking it to your production D1 database. `wrangler.toml` provides placeholders for production D1 configuration (`[[env.production.d1_databases]]`) which usually translates to settings in the Cloudflare dashboard.
- Alternatively, deployment can be done via the Wrangler CLI: `wrangler pages deploy pages` (after running the build script).

**Source Files Referenced:**

- `wrangler.toml` (lines: `pages_build_output_dir`, `[[env.production.d1_databases]]`, `SALT_TOKEN` comments)
- `package.json` (line: `scripts.build`)

## 6. Routing Details

The application uses a two-tiered routing approach:

### 6.1. Cloudflare Pages File-Based Routing

Cloudflare Pages automatically routes requests to files in the `functions` directory.

- A file like `functions/contacts/[[contacts]].js` acts as a catch-all handler for any request path starting with `/contacts/` (e.g., `/contacts`, `/contacts/new`, `/contacts/123`, `/contacts/123/edit`).
- Similarly, `functions/auth/[[auth]].js` handles requests like `/auth/login`, `/auth/register`.
- The `onRequest(context)` function within these files is the entry point.

**Source Files Referenced:**

- Directory structure: `functions/contacts/`, `functions/auth/`
- Filenames: `[[contacts]].js`, `[[auth]].js`

### 6.2. Internal `routey` Function

Within the catch-all function files, the `routey` utility (from `functions/src/utils.js`) provides more granular routing based on HTTP method and URL patterns.

- **Route Definitions**: Each function file (e.g., `[[contacts]].js`) defines an array of `routes`. Each route object specifies:
  - `pattern`: A `UrlPattern` instance (e.g., `new UrlPattern('GET/contacts/:id')`). The pattern string combines the HTTP method (uppercase) and the path. Path segments like `/:id` define capture groups.
  - `handler`: An asynchronous function to execute if the route matches. This handler receives an object with captured parameters (e.g., `{ id: '123' }`).
  - `protected` (optional): A boolean. If `true`, `routey` will call `isAuthenticated(context)` and return a 401 Unauthorized response if the check fails.
- **Matching Logic**: `routey` iterates through the defined routes, attempting to match `METHOD + request.url.pathname` against each `route.pattern`. The first match's handler is executed.
- **404 Handling**: If no route matches, `routey` calls `render404()` to return a standardized 404 page.

**Example Route Definition (from `functions/contacts/[[contacts]].js`):**

```javascript
{ pattern: new UrlPattern('GET/contacts/:id'), handler: viewContact }
{ pattern: new UrlPattern('POST/contacts/new'), handler: newContactPost, protected: true }
```

**Source Files Referenced:**

- `functions/src/utils.js` (lines: `routey` function, `render404` function)
- `functions/contacts/[[contacts]].js` (lines: `routes` array definition and handler functions)
- `functions/auth/[[auth]].js` (lines: `routes` array definition and handler functions)
- `package.json` (dependency: `url-pattern`)

## 7. Authentication Flow

Authentication is session-based, using secure cookies and database-backed sessions.

### 7.1. Registration (`POST /auth/register`)

- **Handler**: `register` function in `functions/auth/[[auth]].js`.
- **Process**:
  1. Reads `email`, `name`, `password` from the request body (parsed by `readRequestBody`).
  2. Hashes the `password` using `hashPassword(password, context.env.SALT_TOKEN)`.
  3. Inserts the new user details (email, name, hashed password) into the `users` D1 table using `DB.insertOne()`.
  4. Redirects the user to the login page (`/auth/login`) upon successful registration.
  5. Returns a 500 error if user creation fails.

### 7.2. Login (`POST /auth/login`)

- **Handler**: `login` function in `functions/auth/[[auth]].js`.
- **Process**:
  1. Reads `email` and `password` from the request body.
  2. Hashes the provided `password`.
  3. Queries the `users` table for a user with the given `email` and hashed `password`.
  4. If no match is found, returns a 400 error ("Unknown user or incorrect password").
  5. If a user is found:
     a. Generates a new session `token` (random string, then hashed using `hashPassword`).
     b. Sets an `expiration` time for the session (e.g., 7 days).
     c. Stores the `user_id`, hashed `token`, and `expires_at` timestamp in the `users_sessions` D1 table.
     d. Sends a 302 redirect response to `/` (homepage).
     e. Sets a `session_token` cookie in the response headers with the (unhashed, pre-hash) generated token. The cookie is configured as: - `HttpOnly`: Not accessible via client-side JavaScript. - `Secure`: Only transmitted over HTTPS. - `SameSite=Strict`: Mitigates CSRF. - `Path=/`: Available for all paths on the domain. - `Expires`: Set to the session's expiration time.

### 7.3. Logout (`GET /auth/logout`)

- **Handler**: `logout` function in `functions/auth/[[auth]].js`. This is a `protected` route.
- **Process**:
  1. Retrieves the `session_token` value from the request's `Cookie` header.
  2. If a token exists, updates its entry in the `users_sessions` table by setting `expires_at` to a time in the past (Unix epoch `0`), effectively invalidating the session.
  3. Sends a 302 redirect response to `/`.
  4. Sets the `session_token` cookie with an expiration date in the past, instructing the browser to delete it.

### 7.4. Route Protection & Session Verification

- **`isAuthenticated(context)` function (`functions/src/utils.js`)**:
  1. Retrieves the `session_token` from the `Cookie` header of the incoming request.
  2. If no token is found, returns `false`.
  3. Queries the `users_sessions` D1 table for a session matching the token and where `expires_at` is in the future.
  4. Returns `true` if a valid, non-expired session is found, `false` otherwise.
  5. Includes a simple in-memory cache (`_authenticated`) for the result within the scope of a single request processing lifecycle to avoid redundant database queries.
- **Usage in `routey`**: If a route is marked `protected: true`, the `routey` function calls `isAuthenticated`. If it returns `false`, `routey` immediately sends a 401 Unauthorized response.

**Source Files Referenced:**

- `functions/auth/[[auth]].js` (lines: `register`, `login`, `logout`, `hashPassword` functions)
- `functions/src/utils.js` (lines: `isAuthenticated`, `readRequestBody`, `routey` protection logic)
- `schema.sql` (lines: `users`, `users_sessions` table definitions)

## 8. Database Schema (`schema.sql`)

The `schema.sql` file defines the structure for the D1 database.

- **`DROP TABLE IF EXISTS ...;`**: Ensures tables can be cleanly recreated.
- **`users` Table**: Stores user account information.
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`: Unique identifier for the user.
  - `email VARCHAR(50) NOT NULL UNIQUE`: User's email address (used for login).
  - `password TEXT NOT NULL`: Stores the hashed password.
  - `name VARCHAR(50) NOT NULL`: User's display name.
- **`users_sessions` Table**: Stores active user sessions for authentication.
  - `session_id INTEGER PRIMARY KEY AUTOINCREMENT`: Unique identifier for the session.
  - `user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE`: Foreign key linking to the `users` table. Sessions are tied to users and will be managed if user records change.
  - `token TEXT NOT NULL`: Stores the hashed session token.
  - `expires_at INTEGER NOT NULL`: Timestamp (milliseconds since epoch) indicating when the session expires.
- **`contacts` Table**: Stores contact information (example application data).
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`: Unique identifier for the contact.
  - `first_name VARCHAR(50) NOT NULL`
  - `last_name VARCHAR(50) NOT NULL`
  - `phone CHAR(15) NOT NULL UNIQUE`
  - `email VARCHAR(100) NOT NULL UNIQUE`
  - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`: Timestamp of when the contact was created.
- **Sample Data**: The file includes numerous `INSERT INTO contacts` statements to populate the `contacts` table with initial data for development and testing.

**Source File Referenced:**

- `schema.sql` (entire file)

## 9. Templating System in Depth

The templating system combines a custom build step with Mustache.js for server-side rendering.

### 9.1. `build.js` and `.gen.js`

- The `build.js` script is crucial. Its `bulkImports('templates', '.html')` function:
  1. Scans `functions/src/templates/` (and its subdirectories like `partials/`) for all files ending in `.html`.
  2. For each found HTML file (e.g., `header.html`, `contacts.html`), it determines a module name (e.g., `header`, `contacts`).
  3. It generates `functions/src/templates/.gen.js`. This generated file contains:
     - `import` statements for each HTML file, treating them as raw string content. The paths in these imports are relative, like `import header from '../templates/header.html';`.
     - An `export` statement that makes all these imported HTML strings available as named exports (e.g., `export { header, contacts, ... };`).
- This mechanism allows server-side JavaScript code (like route handlers in `[[contacts]].js`) to easily access template content:
  ```javascript
  import * as Templates from '../src/templates/.gen.js';
  // Now Templates.header contains the string content of header.html
  // Templates.contacts contains the string content of contacts.html
  ```

### 9.2. Mustache.js Usage

- **Rendering**: The `renderTemplate` function in `functions/src/utils.js` is the primary consumer.
  ```javascript
  // Simplified from utils.js
  // partials.content would be, for example, Templates.contacts
  // data would be { contacts: [{name: ...}], q: 'search_term' }
  const pageHtml = Mustache.render(Templates.index, data, partials);
  ```
- **Data Interpolation**: Uses standard Mustache tags:
  - `{{ variable }}` for escaped data.
  - `{{{ variable }}}` for unescaped HTML (use with caution).
  - `{{# section }} ... {{/ section }}` for conditional blocks or loops.
  - `{{^ section }} ... {{/ section }}` for inverted conditional blocks.
- **Partials**:
  - `{{> partialName }}` syntax is used.
  - The `renderTemplate` function automatically makes `Templates.header` and `Templates.footer` available as `header` and `footer` partials respectively.
  - Route handlers pass the specific content template (e.g., `Templates.contacts`) as the `content` partial:
    ```javascript
    // In a route handler in [[contacts]].js
    const partials = {
    	content: Templates.contacts, // This is the string content of contacts.html
    	controls: Templates.controls, // String content of controls.html from partials/
    };
    return renderTemplate({ contacts: dbResults, q: searchTerm }, partials, context);
    ```
    Inside `Templates.index` (the base layout), `{{> content}}` will then render the `contacts.html` template string using the `data` provided to `renderTemplate`.

### 9.3. Base Layout (`functions/src/templates/index.html`)

- This file acts as the master page for all HTML responses.
- It includes the main HTML structure (`<html>`, `<head>`, `<body>`), CSS links (Bulma, Font Awesome), and JavaScript includes (htmx, dev-refresh).
- Key Mustache placeholders:
  - `<title>{{ title }}</title>`
  - Within `<body>`: `{{> header}} {{> content}} {{> footer}}`
  - The `data` object passed to `renderTemplate` (e.g., `{ title: "My Page", contacts: [...] }`) provides values for these placeholders and for those within the `content`, `header`, and `footer` partials.

**Source Files Referenced:**

- `build.js` (lines: `bulkImports` function)
- `functions/src/templates/.gen.js` (as an example of generated code)
- `functions/src/utils.js` (lines: `renderTemplate` and its use of `Mustache.render`)
- `functions/src/templates/index.html` (as the base layout with partial tags)
- `functions/src/templates/contacts.html` (as an example of a "content" template)
- `functions/src/templates/header.html`, `functions/src/templates/footer.html` (as common partials)
- `functions/contacts/[[contacts]].js` (lines: `allContacts` handler demonstrating how `partials.content` is set)

## 10. Key Configuration Files

### 10.1. `wrangler.toml`

This is the primary configuration file for Cloudflare Wrangler, used to manage and deploy the Pages project.

- `name`: Project identifier.
- `pages_build_output_dir = "pages"`: Tells Wrangler that static assets prepared for deployment are in the `pages` directory.
- `compatibility_date`, `compatibility_flags`: Define compatibility settings for the Workers runtime. `nodejs_compat` is important for using Node.js APIs.
- `[[d1_databases]]`: Defines D1 database bindings.
  - `binding = "DB"`: Makes the database available in Functions via `context.env.DB`.
  - `database_name`, `database_id`: Specify which D1 database to use.
- `[vars]`: For defining environment variables.
  - `SALT_TOKEN` (commented out, with guidance to set securely): Crucial for hashing.
- `[dev]`: Settings for the local development server (`wrangler pages dev`).
  - `port`, `local_protocol`.
- `[env.production.*]`: Sections for production-specific overrides for variables and bindings (e.g., different D1 database ID or `SALT_TOKEN` for production). These are typically set in the Cloudflare Pages dashboard environment settings for a deployed project.

**Source File Referenced:**

- `wrangler.toml` (entire file)

### 10.2. `package.json`

Standard Node.js project manifest file.

- `name`, `version`, `author`, `description`: Basic project information.
- `"type": "module"`: Enables ES Module syntax (`import`/`export`).
- `scripts`: Defines command-line scripts:
  - `"build": "node build.js --production"`: Main build command.
  - `"dev": "SALT_TOKEN=SALT_TOKEN_STRING NO_BUILD=true nodemon"`: Starts the development server with `nodemon` for watching files. This command also sets a default `SALT_TOKEN`.
  - `nodemonConfig`: Configuration for `nodemon`:
    - `watch`: Directories/files to watch.
    - `ext`: Extensions to monitor.
    - `ignore`: Patterns to ignore (e.g., generated files).
    - `exec`: The command `nodemon` runs on change. This command itself runs the build script and then starts `wrangler pages dev`, ensuring `build.js` (template generation) occurs before the server restarts.
- `dependencies`: Runtime dependencies.
  - `"mustache": "^4.2.0"`
  - `"url-pattern": "^1.0.3"`
- `devDependencies`: Development-only dependencies.
  - `"nodemon"`: For the dev server.
  - `"wrangler"`: Cloudflare CLI.

**Source File Referenced:**

- `package.json` (entire file)

</rewritten_file>
