import UrlPattern from 'url-pattern';
import * as T from '@/templates/.gen';
import { renderTemplate, readRequestBody, routey } from '@/utils';
import { DBService } from '@/db';

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const urlParams = new URLSearchParams(url.search);
	const body = await readRequestBody(context.request);
	const DB = new DBService(context.env.DB);

	// https://www.npmjs.com/package/url-pattern
	const routes = [
		//more specific comes first
		{ pattern: new UrlPattern('GET/contacts'), handler: allContacts },
		{ pattern: new UrlPattern('GET/contacts/new'), handler: newContact, protected: true },
		{ pattern: new UrlPattern('GET/contacts/:id'), handler: viewContact },
		{ pattern: new UrlPattern('GET/contacts/:id/edit'), handler: editContact, protected: true },
		{ pattern: new UrlPattern('POST/contacts/new'), handler: newContactPost, protected: true },
		{ pattern: new UrlPattern('POST/contacts/:id/edit'), handler: editContactPost, protected: true },
		{ pattern: new UrlPattern('DELETE/contacts/:id'), handler: contactDelete, protected: true },
	];

	return routey(routes, context);

	/**
	 *
	 * ROUTES
	 *
	 */

	async function allContacts(params) {
		const q = urlParams.get('q');
		const filters = q ? { first_name: q } : {};
		const contacts = await DB.queryAll('contacts', filters);
		const partials = {
			content: T.contacts,
			controls: T.controls,
		};
		return renderTemplate({ q: q, contacts }, partials, context);
	}

	async function newContact(params) {
		const partials = {
			content: T.new_contact,
		};
		return renderTemplate({ action: 'new' }, partials, context);
	}

	async function newContactPost(params) {
		// Still need to figure out form validation
		await DB.insertOne('contacts', body);
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function viewContact(params) {
		const id = params.id;
		const contact = (await DB.queryAll('contacts', { id })).pop();
		if (contact) {
			const partials = {
				content: T.view_contact,
				controls: T.controls,
			};
			return renderTemplate(contact, partials, context);
		}
	}

	async function editContact(params) {
		const id = params.id;
		const contact = (await DB.queryAll('contacts', { id })).pop();
		if (contact) {
			const partials = {
				content: T.new_contact,
			};
			return renderTemplate({ contact, action: `${id}/edit` }, partials, context);
		}
	}

	async function editContactPost(params) {
		const id = params.id;
		await DB.updateOne('contacts', body, { id });
		return Response.redirect(`${url.origin}/contacts`, 303);
	}

	async function contactDelete(params) {
		const id = params.id;
		await DB.deleteById('contacts', { id });
		return Response.redirect(`${url.origin}/contacts`, 303);
	}
}
