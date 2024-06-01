// build.js
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

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
const getAll = (dir, ext = null, exclude = null) =>
	fs.readdirSync(dir).flatMap((file) => {
		const filePath = path.join(dir, file);
		if (exclude && filePath.includes(exclude)) return [];
		if (fs.statSync(filePath).isDirectory()) return getAll(filePath, ext, exclude);
		if (ext && !file.endsWith(ext)) return [];
		return [filePath];
	});

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

// Main Script
const main = async () => {
	fs.rmSync(CONF.outdir, { recursive: true, force: true });
	fs.writeFileSync(path.join(CONF.static, CONF.buildts), `{"timestamp":${Date.now()}}`);
	bulkImports(CONF.templates, '.html');
	// bulkImports(CONF.routes, '.js');
	const entryPoints = getAll(CONF.entry, '.js', CONF.src);

	try {
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
};

main();
