# Super Vanilla Cloudflare Pages

## Still missing

- Form and data validation
  - Either Knex (schema validation) or ajv (json validation)
  - in conjuction with validator.js for complex validation (e.g. phone number)
  - A single schema should result in both sql creation and querying
  - And also form generation in HTML (e.g. generate form for Schema X)

## Overview

Vanilla Cloudflare Pages provides a minimalistic, full-stack solution for deploying Cloudflare Pages without relying on any frameworks. This project aims to leverage the power of automatically turning scripts inside the `/functions_` folder into workers, combined with the most basic JavaScript capabilities, reminiscent of old-school PHP or CGI setups.

## Project Structure

The project is organized as follows:

```
functions_/
    ├── api/
        ├── [[api]].js          #everything on host/api comes here
        ├── ...
    ├── auth/
        ├── [[auth]].js         #everything on host/auth comes here
        ├── ...
    ├── contacts/
        ├── [[contacts]].js     #this is the app router
        ├── ...
    ├── another_app/
        ├── [[another_app]].js  #this is the app router
        ├── ...
    ├── src/                    #everything in src/ will be bundled as needed
        ├── templates/
            ├── footer.html
            ├── header.html
            ├── index.html
            ├── .gen.js         #a generated file for dynamic importing
        ├── utils.js
index.js
dynamic_page_2.js
pages/
    ├── 404.html
    ├── static_page_2.html
    ├── buildts.gen.json        #a timestamp of the last build, for local use only
    ├── dev-refresh.js          #refreshes the page every few seconds for dev
build.js                        #build script using esbuild
package.json
schema.sql                      #initial config for demo database
wrangler.toml
```

## Debugging on VSCode

Debugging works with breakpoints on the code under functions\_ thanks to source mapping generated by build.js. Run `npm run dev` and then turn on the wrangler debugger by pressing play on Run and Debug `Ctrl + Shift + D`.

## Features

- **Ultra Vanilla, Pure JavaScript:** Minimal dependencies for simplicity and performance.
- **Template System:** Uses Mustache.js for templating.
- **File Watch with Automatic Rebuild:** Automatically rebuilds the project on file changes.
- **Browser Auto-refresh:** Browser polls for changes and refreshes automatically.
- **Automatic Function Bundling:** The `/functions` folder is built using `npm run build`.
- **Authentication:** Basic authentication module implemented with cookies

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm

### Installation

Clone the repository and install the dependencies:

```sh
git clone https://github.com/ibercovich/vanilla-cloudflare-pages.git
cd vanilla-cloudflare-pages
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
