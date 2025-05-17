// build.js
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

// Parse command line arguments to determine if we're in production mode
const args = process.argv.slice(2);
const isProd = args.includes('--production');

// Configuration
// Ideally this conf is an .env available to all functions
// For example, dev-refresh refers directly to "buildts.gen.json"
const CONF = {
	entry: 'functions_',
	src: 'functions_/src',
	templates: 'templates',
	routes: 'routes',
	buildts: 'buildts.gen.json',
	outdir: 'functions',
	static: 'pages',
};

// Utility Functions

// Simple copy operation: copy all files from functions_ to functions
const copyFiles = (srcDir, destDir) => {
	if (!fs.existsSync(destDir)) {
		fs.mkdirSync(destDir, { recursive: true });
	}

	const entries = fs.readdirSync(srcDir, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(srcDir, entry.name);
		const destPath = path.join(destDir, entry.name);

		if (entry.isDirectory()) {
			copyFiles(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
};

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
	const imports = files.map(({ name, relativePath }) => `import ${name} from '@/${relativePath}';`).join('\n');
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
	// Clean output directory
	fs.rmSync(CONF.outdir, { recursive: true, force: true });

	// Create a timestamp file for cache busting on the client
	fs.writeFileSync(path.join(CONF.static, CONF.buildts), `{"timestamp":${Date.now()}}`);

	// Generate template imports
	bulkImports(CONF.templates, '.html');
	// bulkImports(CONF.routes, '.js');

	// Check if NO_BUILD environment variable is set
	if (process.env.NO_BUILD) {
		console.log('NO_BUILD flag detected. Skipping bundling and copying files directly...');

		// Create the output directory
		fs.mkdirSync(CONF.outdir, { recursive: true });

		// Copy everything from functions_ to functions
		copyFiles(CONF.entry, CONF.outdir);

		console.log(`Files copied from ${CONF.entry} to ${CONF.outdir}`);
	} else {
		// Find all JavaScript entry points
		const entryPoints = getAll(CONF.entry, '.js', CONF.src);

		try {
			// Bundle with esbuild
			await esbuild.build({
				entryPoints,
				outdir: CONF.outdir,
				bundle: true,
				minify: isProd ? false : true,
				sourcemap: isProd ? false : true, //should turn them off in prod
				target: 'es2015',
				format: 'esm',
				splitting: true,
				keepNames: false,
				alias: {
					'@': `./${CONF.src}`,
				},
				loader: {
					'.html': 'text', //include html
				},
			});
		} catch (error) {
			console.error('Build failed:', error);
			process.exit(1);
		}
	}
};

// Execute the main build process
main();
