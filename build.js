// build.js
import fs from 'node:fs';
import path from 'node:path';
// import esbuild from 'esbuild';

// Parse command line arguments to determine if we're in production mode
// const args = process.argv.slice(2);
// const isProd = args.includes('--production');

// Configuration
// Ideally this conf is an .env available to all functions
// For example, dev-refresh refers directly to "buildts.gen.json"
const CONF = {
	entry: 'functions',
	src: 'functions/src',
	templates: 'templates',
	// routes: 'routes',
	buildts: 'buildts.gen.json',
	// outdir: 'functions',
	static: 'pages',
};

// Utility Functions

/**
 * Recursively fetches all files from a directory and its subdirectories
 *
 * @param {string} dir - The directory to search
 * @param {string|null} ext - Optional file extension to filter by (e.g. '.html')
 * @param {string|null} exclude - Optional pattern to exclude files/directories
 * @returns {string[]} Array of file paths matching the criteria
 */
const getAll = (dir, ext = null, exclude = null) =>
	fs.readdirSync(dir).flatMap((file) => {
		const filePath = path.join(dir, file);
		if (exclude && filePath.includes(exclude)) return [];
		if (fs.statSync(filePath).isDirectory()) return getAll(filePath, ext, exclude);
		if (ext && !file.endsWith(ext)) return [];
		return [filePath];
	});

/**
 * Generates a JavaScript module that imports and exports all files of a specific type
 * This creates the .gen.js files that make templates available to the application
 *
 * @param {string} type - The type of files to process (e.g. 'templates')
 * @param {string} ext - File extension to filter by (e.g. '.html')
 */
const bulkImports = (type, ext) => {
	const dir = path.join(CONF.src, type);
	const dest = path.join(dir, `.gen.js`);
	fs.rmSync(dest, { force: true }); //delete existing
	const files = getAll(dir, ext).map((_path) => ({
		name: path.basename(_path, ext),
		relativePath: path.relative(CONF.src, _path).replace(/\\/g, '/'),
	}));

	// For templates/.gen.js in src/templates directory, it needs to reference files in the same src directory
	// So we go up one level from templates with "../"
	const imports = files.map(({ name, relativePath }) => `import ${name} from '../${relativePath}';`).join('\n');
	const exports = `export { ${files.map((f) => f.name).join(', ')} };`;
	fs.writeFileSync(dest, `${imports}\n\n${exports}\n`, 'utf8');
};

/**
 * Main build function that:
 * 1. Cleans the output directory
 * 2. Creates a timestamp file for cache busting
 * 3. Generates template imports
 * 4. Either bundles JavaScript files using esbuild or copies files directly if NO_BUILD env var is set
 */
const main = async () => {
	// Create a timestamp file for cache busting on the client
	fs.writeFileSync(path.join(CONF.static, CONF.buildts), `{"timestamp":${Date.now()}}`);

	// Generate template imports
	bulkImports(CONF.templates, '.html');
	// bulkImports(CONF.routes, '.js');
};

// Execute the main build process
main();
