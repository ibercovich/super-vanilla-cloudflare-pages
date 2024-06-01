import Mustache from 'mustache';
// https://ejs.co/#docs // alternative in case mustache becomes limiting
import * as T from '@/templates/.gen';
import _404 from '../../pages/404.html';
import { DBService } from '@/db';

// Join the strings and values to return the final HTML string
// This is a simple version that lacks features of larger libraries
// if using _validator_ library, use escape utility from there
const escapeHTML = (str) => str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const html = (strings, ...values) =>
	strings.reduce(
		(result, string, i) => result + string + (values[i] != null ? (typeof values[i] === 'string' ? escapeHTML(values[i]) : values[i]) : ''),
		''
	);

export function render404() {
	const content = _404;
	const html = Mustache.render(T.index, { title: 'Not Found' }, { content });
	return new Response(html, {
		status: 404,
		headers: {
			'Content-Type': 'text/html',
			'Cache-Control': 'no-cache',
		},
	});
}

export async function renderTemplate(data, partials = {}, context) {
	// https://github.com/janl/mustache.jss
	// data = data || {};
	partials = partials || {};
	partials.header = T.header;
	partials.footer = T.footer;
	const content = Mustache.render(T.index, data, partials);
	return new Response(content, {
		headers: { 'Content-Type': 'text/html' },
	});
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
export async function readRequestBody(request) {
	const contentType = request.headers.get('content-type');
	if (contentType) {
		if (contentType.includes('application/json')) {
			return await request.json();
		} else if (contentType.includes('application/text')) {
			return await request.text();
		} else if (contentType.includes('text/html')) {
			return await request.text();
		} else if (contentType.includes('form')) {
			const formData = await request.formData();
			const body = {};
			for (const entry of formData.entries()) {
				body[entry[0]] = entry[1];
			}
			return body;
		} else {
			// Perhaps some other type of data was submitted in the form
			// like an image, or some other binary data.
			return 'a file';
		}
	}
}

export async function routey(routes, context) {
	const url = new URL(context.request.url);
	const method = context.request.method;
	const routerPath = `${method}${url.pathname}`;
	const authenticated = await isAuthenticated(context);
	console.log(`Routing to: ${routerPath}`);
	let response = null;
	for (const route of routes) {
		const match = route.pattern.match(routerPath);
		if (match) {
			// Check if the route requires authentication
			if (route.protected && !authenticated) {
				return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
					headers: { 'Content-Type': 'application/json' },
					status: 401,
				});
			}
			response = await route.handler(match);
			break; // Exit the loop once a match is found and handler is called
		}
	}
	return response ? response : render404();
}

let _authenticated = null; // closure for caching
// Function to check if a request is authenticated
export async function isAuthenticated(context) {
	//return from cache
	if (_authenticated === true || _authenticated === false) {
		return _authenticated;
	}

	const DB = new DBService(context.env.DB);
	// const headers = request.headers.getSetCookie();
	const cookieHeader = context.request.headers.get('Cookie');
	if (!cookieHeader) return false;

	const cookies = new Map(cookieHeader.split(';').map((cookie) => cookie.split('=').map((v) => v.trim())));
	const token = cookies.get('session_token');
	if (!token) return false;

	// Validate session token in your database
	const currentTime = new Date().getTime();
	const query = 'SELECT * FROM users_sessions WHERE token = ? AND expires_at > ?';
	const results = (await DB.runQuery(query, [token, currentTime])) || [];

	return results.length > 0;
}
