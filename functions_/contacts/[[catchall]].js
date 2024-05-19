import UrlPattern from 'url-pattern';
import { renderTemplate, DBupdateOne, readRequestBody, DBgetMany, DBdeleteById, DBinsertOne } from '@/utils';

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const urlParams = new URLSearchParams(url.search);
	const body = await readRequestBody(context.request);
	const DB = context.env.DB;
	// const params = context.params.catchall;
	const method = context.request.method;
	const routerPath = `${method}${url.pathname}`;
	let response = null;

	console.log(`${routerPath} on main router`);

	// https://www.npmjs.com/package/url-pattern
	const routes = [
		{ pattern: new UrlPattern('GET/contacts'), handler: allContacts },
		{ pattern: new UrlPattern('GET/contacts/new'), handler: newContact }, //more specific on top
		{ pattern: new UrlPattern('GET/contacts/:id'), handler: viewContact },
		{ pattern: new UrlPattern('GET/contacts/:id/edit'), handler: editContact },
		{ pattern: new UrlPattern('POST/contacts/new'), handler: newContactPost }, //more specific on top
		{ pattern: new UrlPattern('POST/contacts/:id/edit'), handler: editContactPost },
		{ pattern: new UrlPattern('POST/contacts/:id/delete'), handler: deleteContactPost },
	];

	for (const route of routes) {
		const match = route.pattern.match(routerPath);
		if (match) {
			response = await route.handler(match);
			break; // Exit the loop once a match is found and handler is called
		}
	}

	return response ? response : Response.redirect(`${url.origin}/404`, 303);

	/**
	 *
	 * ROUTES
	 *
	 */

	async function allContacts(params) {
		const q = urlParams.get('q');
		const filters = q ? { first_name: q } : null;
		const contacts = await DBgetMany(DB, 'contacts', filters);
		return await renderTemplate('contacts', { q: q, contacts });
	}

	async function newContact(params) {
		return await renderTemplate('new_contact', { action: 'new' });
	}

	async function newContactPost(params) {
		// Still need to figure out form validation
		const result = await DBinsertOne(DB, 'contacts', body);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function viewContact(params) {
		const id = params.id;
		const contact = (await DBgetMany(DB, 'contacts', { id })).pop();
		if (contact) {
			return await renderTemplate('view_contact', { contact });
		}
	}

	async function editContact(params) {
		const id = params.id;
		const contact = (await DBgetMany(DB, 'contacts', { id })).pop();
		if (contact) {
			return await renderTemplate('new_contact', { contact, action: `${id}/edit` });
		}
	}

	async function editContactPost(params) {
		const id = params.id;
		const result = await DBupdateOne(DB, 'contacts', body, id);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function deleteContactPost(params) {
		const id = params.id;
		const result = await DBdeleteById(DB, id);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}
}
