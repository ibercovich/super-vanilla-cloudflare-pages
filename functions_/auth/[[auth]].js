import UrlPattern from 'url-pattern';
import { readRequestBody, render404, renderTemplate } from '@/utils';
import * as T from '@/templates/.gen';
import DB from '@/db';

export async function onRequest(context) {
	const url = new URL(context.request.url);
	// const urlParams = new URLSearchParams(url.search);
	const body = await readRequestBody(context.request);
	const connection = context.env.DB;
	const method = context.request.method;
	const routerPath = `${method}${url.pathname}`;
	let response = null;

	console.log(`${routerPath} on auth router`);

	// https://www.npmjs.com/package/url-pattern
	const routes = [
		{ pattern: new UrlPattern('GET/auth'), handler: authView },
		{ pattern: new UrlPattern('POST/auth/signup'), handler: signup },
		{ pattern: new UrlPattern('POST/auth/login'), handler: login },
		{ pattern: new UrlPattern('GET/auth/logout'), handler: logout },
	];

	for (const route of routes) {
		const match = route.pattern.match(routerPath);
		if (match) {
			response = await route.handler(match);
			break; // Exit the loop once a match is found and handler is called
		}
	}

	return response ? response : render404();

	/**
	 *
	 * ROUTES
	 *
	 */

	async function authView() {
		const partials = {
			content: T.auth,
		};
		return renderTemplate(T.index, {}, partials);
	}

	async function login() {
		// Attempt to fetch the user by email and verify password
		const email = body.email;
		const password = await hashPassword(body.password, context.env.SALT_TOKEN);
		const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
		const preparedQuery = connection.prepare(query).bind(email, password);
		const { results } = await DB.runQuery(preparedQuery);

		if (results.length === 0) {
			console.log(`Authentication failed for ${email}`);
			return new Response(JSON.stringify({ success: false, errors: 'Unknown user or incorrect password' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			});
		}

		const user = results.pop();

		let expiration = new Date();
		expiration.setDate(expiration.getDate() + 7); // Set the new session expiration to 7 days in the future

		// Insert a new session for the user
		// Generate a more complex and secure session token by using base-36 encoding and removing the predictable prefix "1."
		const sessionToken = await hashPassword((Math.random() + 1).toString(36).substring(2), context.env.SALT_TOKEN);
		const sessionQuery = 'INSERT INTO users_sessions (user_id, token, expires_at) VALUES (?,?,?) RETURNING *';
		const sessionPreparedQuery = connection.prepare(sessionQuery).bind(user.id, sessionToken, expiration.getTime());
		const { results: sessionResults } = await DB.runQuery(sessionPreparedQuery);
		const { token, expires_at } = sessionResults.pop();

		// Set cookie header in the response
		const _response = { success: true, result: { session: { token, expires_at } } };
		return new Response(null, {
			headers: {
				Location: '/',
				'Set-Cookie': `session_token=${sessionToken}; Path=/; Expires=${expiration.toUTCString()}; SameSite=Strict; Secure; HttpOnly`, //HttpOnly
				'Content-Type': 'text/html', // Usually set to text/html for a redirect, but can be omitted
			},
			status: 302,
		});
	}

	// Logout handler
	async function logout() {
		/**
		 * set the expiration time of the session to a time in the past, effectively invalidating it.
		 * This method keeps a record of the session in the database, which might be useful for
		 *  logging or auditing purposes.
		 */
		const cookieHeader = context.request.headers.get('Cookie');
		const cookies = new Map(cookieHeader.split(';').map((cookie) => cookie.trim().split('=')));
		const sessionToken = cookies.get('session_token');

		if (sessionToken) {
			const pastTime = new Date(0).getTime(); // UNIX epoch start
			const updateQuery = 'UPDATE users_sessions SET expires_at = ? WHERE token = ?';
			const preparedUpdateQuery = connection.prepare(updateQuery).bind(pastTime, sessionToken);
			await DB.runQuery(preparedUpdateQuery);
		}

		return new Response(JSON.stringify({ success: true }), {
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; HttpOnly; Secure',
			},
			status: 200,
		});
	}

	async function signup() {
		// Validate the request body against the schema
		const parsed = body; // requestBodySchema.parse(body);

		// Hash password and insert data into database
		const hashedPassword = await hashPassword(parsed.password, context.env.SALT_TOKEN);
		const query = 'INSERT INTO users (email, name, password) VALUES (?,?,?) RETURNING *';
		const preparedQuery = connection.prepare(query).bind(parsed.email, parsed.name, hashedPassword);
		const { results } = await DB.runQuery(preparedQuery);

		if (results.length === 0) {
			console.log(`Registration failed for ${parsed.email}`);
			// Handle errors, including validation and database errors
			return new Response(JSON.stringify({ success: false, errors: "Couldn't create user" }), {
				headers: { 'Content-Type': 'application/json' },
				status: 500,
			});
		}

		const user = results.pop();

		// Send successful response
		return new Response(JSON.stringify({ success: true, result: { user } }), {
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		});
	}
}

async function hashPassword(password, salt) {
	const utf8 = new TextEncoder().encode(`${salt}:${password}`);
	const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, utf8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
	return hash;
}

// Function to check if a request is authenticated
export async function isAuthenticated(context) {
	const connection = context.env.DB;
	// const headers = request.headers.getSetCookie();
	const cookieHeader = context.request.headers.get('Cookie');
	console.log(`request: ${JSON.stringify(context.request, null, 4)}`);
	if (!cookieHeader) return false;

	const cookies = new Map(cookieHeader.split(';').map((cookie) => cookie.split('=').map((v) => v.trim())));
	const sessionToken = cookies.get('session_token');
	if (!sessionToken) return false;

	// Validate session token in your database
	const currentTime = new Date().getTime();
	const query = 'SELECT * FROM users_sessions WHERE token = ? AND expires_at > ?';
	const preparedQuery = connection.prepare(query).bind(sessionToken, currentTime);
	const { results } = await DB.runQuery(preparedQuery);
	return results.length > 0;
}
