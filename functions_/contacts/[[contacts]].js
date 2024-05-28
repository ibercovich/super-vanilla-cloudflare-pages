import UrlPattern from 'url-pattern';
import * as T from '@/templates/.gen';
import { renderTemplate, readRequestBody, render404 } from '@/utils';
import DB from '@/db';
import { isAuthenticated } from '../auth/[[auth]]';

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const urlParams = new URLSearchParams(url.search);
	const body = await readRequestBody(context.request);
	const connection = context.env.DB;
	// const params = context.params.contacts;
	const method = context.request.method;
	const routerPath = `${method}${url.pathname}`;
	let response = null;

	console.log(`${routerPath} on main router`);

	// https://www.npmjs.com/package/url-pattern
	const routes = [
		{ pattern: new UrlPattern('GET/contacts'), handler: allContacts },
		{ pattern: new UrlPattern('GET/contacts/new'), handler: newContact }, //more specific on top
		{ pattern: new UrlPattern('GET/contacts/:id'), handler: viewContact },
		{ pattern: new UrlPattern('GET/contacts/:id/edit'), handler: editContact, protected: true },
		{ pattern: new UrlPattern('POST/contacts/new'), handler: newContactPost }, //more specific on top
		{ pattern: new UrlPattern('POST/contacts/:id/edit'), handler: editContactPost, protected: true },
		{ pattern: new UrlPattern('DELETE/contacts/:id'), handler: contactDelete },
	];

	for (const route of routes) {
		const match = route.pattern.match(routerPath);
		if (match) {
			// Check if the route requires authentication
			if (route.protected && !(await isAuthenticated(context))) {
				return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
					headers: { 'Content-Type': 'application/json' },
					status: 401,
				});
			}
			response = await route.handler(match, context);
			break; // Exit the loop once a match is found and handler is called
		}
	}

	return response ? response : render404();

	/**
	 *
	 * ROUTES
	 *
	 */

	async function allContacts(params) {
		const q = urlParams.get('q');
		const filters = q ? { first_name: q } : null;
		const contacts = await DB.getMany(connection, 'contacts', filters);
		const partials = {
			content: T.contacts,
			controls: T.controls,
		};
		// return await renderTemplate(T.index, { q: q, contacts }, T.contacts);
		return renderTemplate(T.index, { q: q, contacts }, partials);
	}

	async function newContact(params) {
		const partials = {
			content: T.new_contact,
		};
		return renderTemplate(T.index, { action: 'new' }, partials);
	}

	async function newContactPost(params) {
		// Still need to figure out form validation
		console.log(body);
		await DB.insertOne(connection, 'contacts', body);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function viewContact(params) {
		const id = params.id;
		const contact = (await DB.getMany(connection, 'contacts', { id })).pop();
		if (contact) {
			const partials = {
				content: T.view_contact,
				controls: T.controls,
			};
			return renderTemplate(T.index, contact, partials);
		}
	}

	async function editContact(params) {
		const id = params.id;
		const contact = (await DB.getMany(connection, 'contacts', { id })).pop();
		if (contact) {
			const partials = {
				content: T.new_contact,
			};
			return renderTemplate(T.index, { contact, action: `${id}/edit` }, partials);
		}
	}

	async function editContactPost(params) {
		const id = params.id;
		await DB.updateOne(connection, 'contacts', body, id);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function contactDelete(params) {
		const id = params.id;
		await DB.deleteById(connection, id);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}
}
