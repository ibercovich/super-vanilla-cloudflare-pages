# Super Vanilla Cloudflare Pages Project

[Live Demo](https://super-vanilla-cloudflare-pages.pages.dev/)

## Overview

This project is a simple Content Management System (CMS) or a foundational application demonstrating common web application patterns on the Cloudflare serverless platform. It utilizes Cloudflare Pages for hosting static assets and serverless functions, Cloudflare D1 for its database, and a custom-built, lightweight system for routing, templating, and authentication. The emphasis is on minimizing external dependencies and providing a clear, understandable architecture.

Key Technologies documented include:

- Cloudflare Pages (Static hosting & Functions)
- Cloudflare D1 (Serverless SQL Database)
- JavaScript (ES Modules)
- Node.js (for the build script and development environment)
- Mustache.js (Templating)
- htmx (for enhanced HTML interactions)
- Bulma (CSS Framework)
- Font Awesome (Icons)

(For a comprehensive understanding, please refer to `DOCUMENTATION.md`.)

## Project Structure

The project is organized as follows (see `DOCUMENTATION.md` for full details):

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
│       ├── schemas/         # (Potentially for data validation schemas - currently not fully utilized)
│       ├── templates/
│       │   ├── .gen.js      # Auto-generated: exports all HTML templates as modules
│       │   ├── contacts.html
│       │   ├── footer.html
│       │   ├── header.html
│       │   ├── index.html     # Base layout template
│       │   ├── login.html
│       │   ├── new_contact.html
│       │   ├── view_contact.html
│       │   └── partials/
│       │       └── controls.html
│       └── utils.js         # Core utility functions (routing, rendering, auth check)
├── package.json             # Project metadata, dependencies, and scripts
├── pages/                   # Static assets served by Cloudflare Pages
│   ├── 404.html             # Custom 404 page
│   ├── buildts.gen.json     # Auto-generated: timestamp for dev refresh
│   ├── dev-refresh.js       # Client-side script for live reload in dev
│   └── super-vanilla.png    # Example static image asset
├── schema.sql               # D1 database schema and sample data
├── wrangler.toml            # Cloudflare Wrangler configuration
└── README.md                # This file
└── DOCUMENTATION.md         # Comprehensive project documentation
```

_Note: The `functions/src/schemas/` directory is noted in `DOCUMENTATION.md` as potentially for data validation schemas but currently not fully utilized._

## Debugging on VSCode

Debugging works with breakpoints on the code under `functions/` thanks to source mapping. Run `npm run dev` and then turn on the wrangler debugger by pressing play on Run and Debug `Ctrl + Shift + D`. (This information is from the original README; refer to `DOCUMENTATION.md` for build script details which may impact source mapping if `esbuild` usage changes).

## Features

Based on `DOCUMENTATION.md`:

- **Minimal Dependencies, JavaScript Focus:** Emphasizes a lightweight approach using ES Modules.
- **Template System:** Uses Mustache.js for server-side templating. HTML templates are bundled into an importable `.gen.js` file by `build.js`.
- **File Watch with Automatic Rebuild (Dev):** `npm run dev` uses `nodemon` to watch for file changes, triggering `build.js` and restarting the dev server.
- **Browser Auto-refresh (Dev):** `pages/dev-refresh.js` polls a timestamp file (`pages/buildts.gen.json`, updated by `build.js`) to reload the browser on changes.
- **Cloudflare Functions & File-Based Routing:** Server-side logic resides in `functions/`. Cloudflare Pages provides file-based routing (e.g., `functions/contacts/[[contacts]].js` for `/contacts/*`). A custom internal router (`utils.js:routey`) further refines routing.
- **Authentication:** A custom cookie-based authentication module is implemented, with sessions stored in D1 and password/session tokens hashed.

## Getting Started

### Prerequisites

Ensure you have the following installed (as per `DOCUMENTATION.md` Sec 4.1):

- Node.js
- npm (comes with Node.js)
- Wrangler CLI (`npm install -g wrangler` or use `npx`)

### Installation

Clone the repository and install the dependencies (as per `DOCUMENTATION.md` Sec 4.2):

```sh
git clone https://github.com/ibercovich/vanilla-cloudflare-pages.git # Or your fork
cd vanilla-cloudflare-pages
npm install
```

### Running Locally

To start the development server (as per `DOCUMENTATION.md` Sec 4.4):

```sh
npm run dev
```

This command, via `nodemon` configuration in `package.json`:

1. Sets necessary environment variables (e.g., `SALT_TOKEN`).
2. Runs `build.js` (to generate template modules and the dev-refresh timestamp).
3. Starts `wrangler pages dev` to serve the application.

Ensure `SALT_TOKEN` is appropriately set for development as outlined in `DOCUMENTATION.md` (Sec 4.3).

### Building for Production

To build the project for production (as per `DOCUMENTATION.md` Sec 5.1):

```sh
npm run build
```

This executes `node build.js --production`, which primarily bundles HTML templates and creates the `buildts.gen.json` file. The build output directory for static assets is `pages/`.

### Creating and Initializing Databases

To create and initialize a D1 database (this information is from the original README, consistent with D1 usage in `DOCUMENTATION.md`):

```sh
# Replace super-vanilla with your desired database name if different
npx wrangler d1 create your-database-name
# Initialize local D1 database
npx wrangler d1 execute your-database-name --local --file=./schema.sql
# Initialize remote D1 database
npx wrangler d1 execute your-database-name --remote --file=./schema.sql
```

Refer to `schema.sql` for table structures and `wrangler.toml` for database binding configuration.

### Configure Cloudflare Pages Deployment

Based on `DOCUMENTATION.md` (Sec 5.2):

- **Build command**: `npm run build`
- **Build output directory**: `pages`
- **Environment Variables & Bindings**:
  - **`SALT_TOKEN`**: Set as a **secret** environment variable in the Cloudflare Pages project settings.
  - **D1 Database**: Configure the D1 database binding named `DB` in the Cloudflare Pages project settings, linking it to your production D1 database. `wrangler.toml` shows the development binding:
    ```toml
    [[d1_databases]]
    binding = "DB" # This is the binding name to use in Pages settings
    database_name = "super-vanilla" # Your D1 DB name
    database_id = "your-production-db-id" # Your D1 DB ID
    ```

Refer to `DOCUMENTATION.md` for more details on each topic.
