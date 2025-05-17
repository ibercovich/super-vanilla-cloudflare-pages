import UrlPattern from 'url-pattern';
import { readRequestBody, renderTemplate, routey, isAuthenticated, html } from '../src/utils.js';
import * as T from '../src/templates/.gen.js';
import { DBService } from '../src/db.js';

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const body = await readRequestBody(context.request);
	const DB = new DBService(context.env.DB);

	// https://www.npmjs.com/package/url-pattern
	const routes = [
		{ pattern: new UrlPattern(/^GET\/auth\/(register|login)$/), handler: loginView },
		{ pattern: new UrlPattern('GET/auth/controls'), handler: controlsView },
		{ pattern: new UrlPattern('POST/auth/register'), handler: register },
		{ pattern: new UrlPattern('POST/auth/login'), handler: login },
		{ pattern: new UrlPattern('GET/auth/logout'), handler: logout, protected: true },
	];

	return routey(routes, context);

	/**
	 *
	 * ROUTES
	 *
	 */

	async function loginView(params) {
		const is_register = params[0] == 'register';
		const action = is_register ? 'register' : 'login';
		const partials = {
			content: T.login,
		};
		return renderTemplate({ action, is_register }, partials, context);
	}

	async function controlsView(params) {
		const content = (await isAuthenticated(context))
			? html`
					<a class="button is-primary" href="/auth/logout">Log out</a>
				`
			: html`
					<a class="button is-light" href="/auth/login">Log in</a>
				`;
		// returns partial html
		return new Response(content, {
			headers: { 'Content-Type': 'text/html' },
		});
	}

	async function login() {
		// Attempt to fetch the user by email and verify password
		const email = body.email;
		const password = await hashPassword(body.password, context.env.SALT_TOKEN);
		const results = await DB.queryAll('users', { email, password });

		if (results.length === 0) {
			console.log(`Authentication failed for ${email}`);
			return new Response(JSON.stringify({ success: false, errors: 'Unknown user or incorrect password' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			});
		}

		const user_id = results.pop().id;
		const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // session expiration to 7 days in the future
		const expires_at = expiration.getTime(); // timestamp in milliseconds

		// Insert a new session for the user
		// Generate a more complex and secure session token by using base-36 encoding and removing the predictable prefix "1."
		const token = await hashPassword((Math.random() + 1).toString(36).substring(2), context.env.SALT_TOKEN);
		const sessionResults = await DB.insertOne('users_sessions', { user_id, token, expires_at });

		// Set cookie header in the response
		return new Response(null, {
			headers: {
				Location: '/',
				'Set-Cookie': `session_token=${token}; Path=/; Expires=${expiration.toUTCString()}; SameSite=Strict; Secure; HttpOnly`,
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
		const token = cookies.get('session_token');

		if (token) {
			const expires_at = new Date(0).getTime(); // UNIX epoch start
			await DB.updateOne('users_sessions', { expires_at }, { token });
		}
		return new Response(null, {
			headers: {
				Location: '/',
				'Set-Cookie': `session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure; HttpOnly`,
				'Content-Type': 'text/html', // Usually set to text/html for a redirect, but can be omitted
			},
			status: 302,
		});
	}

	async function register() {
		// Validate the request body against the schema
		const { email, name, password } = body;

		// Hash password and insert data into database
		const hashedPassword = await hashPassword(password, context.env.SALT_TOKEN);
		const results = await DB.insertOne('users', { email, name, password: hashedPassword });

		if (results.length === 0) {
			console.log(`Registration failed for ${email}`);
			// Handle errors, including validation and database errors
			return new Response(JSON.stringify({ success: false, errors: "Couldn't create user" }), {
				headers: { 'Content-Type': 'application/json' },
				status: 500,
			});
		}

		// Send successful response
		return Response.redirect(`${url.origin}/auth/login`, 303);
	}
}

async function hashPassword(password, salt) {
	const utf8 = new TextEncoder().encode(`${salt}:${password}`);
	const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, utf8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
	return hash;
}
