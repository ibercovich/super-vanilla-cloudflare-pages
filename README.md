# Super Vanilla Cloudflare Pages

## Still missing

- Form and data validation
- Debugger implementation
- Authentication

## Overview

Vanilla Cloudflare Pages provides a minimalistic, full-stack solution for deploying Cloudflare Pages without relying on any frameworks. This project aims to leverage the power of automatically turning scripts inside the `/functions` folder into workers, combined with the most basic JavaScript capabilities, reminiscent of old-school PHP or CGI setups.

## Project Structure

The project is organized as follows:

```
functions_/
    ├── api/
        ├── api_1.js
        ├── ...
    ├── src/
        ├── routes/
        ├── templates/
            ├── footer.html
            ├── header.html
            ├── index.html
            ├── .gen.js
        ├── utils.js
    ├── contacts/  # a sample app
        ├── [[catchall]].js # main router for app
        ├── test.js
index.js
dynamic_page_2.js
pages/
    ├── 404.html
    ├── static_page_2.html
    ├── buildts.gen.json
    ├── dev-refresh.js
build.js
package.json
schema.sql
wrangler.toml
```

## Features

- **Ultra Vanilla, Pure JavaScript:** Minimal dependencies for simplicity and performance.
- **Template System:** Uses Mustache.js for templating.
- **File Watch with Automatic Rebuild:** Automatically rebuilds the project on file changes.
- **Browser Auto-refresh:** Browser polls for changes and refreshes automatically.
- **Automatic Function Bundling:** The `/functions` folder is built using `npm run build`.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm

### Installation

Clone the repository and install the dependencies:

```sh
git clone https://github.com/ibercovich/super-vanilla-cloudflare-pages
cd super-vanilla-cloudflare-pages
npm install
```

### Running Locally

To start the development server with automatic rebuild and browser refresh:

```sh
npm run dev
```

### Building for Production

To build the project for production:

```sh
npm run build
```

Build output directory `pages`.

### Creating Databases

To create and initialize a database with Cloudflare Wrangler:

```sh
wrangler d1 create database_name
wrangler d1 execute database_name --local --file=schema.sql
wrangler d1 execute database_name --remote --file=schema.sql
```
