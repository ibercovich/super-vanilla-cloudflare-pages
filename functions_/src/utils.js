import Mustache from 'mustache';
// https://ejs.co/#docs // alternative in case mustache becomes limiting
import * as T from '@/templates/.gen';
import _404 from '../../pages/404.html';

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

export function renderTemplate(template, data, partials) {
	// https://github.com/janl/mustache.jss
	const html = Mustache.render(template, data, partials);
	return new Response(html, {
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
