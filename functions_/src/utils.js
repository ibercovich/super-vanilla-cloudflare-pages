import Mustache from 'mustache';
import * as Templates from '@/templates/.gen';

export async function renderTemplate(name, data) {
	// https://github.com/janl/mustache.js
	let tpl = '';
	if (name in Templates) {
		tpl = Templates[name];
	}
	const html = await Mustache.render(Templates['index'], data, { content: tpl });
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
			return request.text();
		} else if (contentType.includes('text/html')) {
			return request.text();
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

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} obj : key value pairs for insertion
 */
export async function DBinsertOne(DB, table, obj) {
	let fields = [];
	let values = [];

	Object.entries(obj).forEach(([key, value]) => {
		fields.push(key);
		values.push(value);
	});

	let query = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${Array(fields.length).fill('?').join(', ')})`;

	try {
		return await DB.prepare(query)
			.bind(...values)
			.run();
	} catch (error) {
		// Code to handle the error
		const niceError = JSON.stringify(error, null, 4);
		console.error('An error occurred:', niceError);
		return niceError;
	}
}

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} obj : key value pairs for update
 * @param {string|number} id : the id of the record to be updated
 */
export async function DBupdateOne(DB, table, obj, id) {
	let fields = [];
	let values = [];

	Object.entries(obj).forEach(([key, value]) => {
		fields.push(`${key} = ?`);
		values.push(value);
	});

	values.push(id);

	let query = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`;

	const preparedQuery = await DB.prepare(query).bind(...values);
	return await preparedQuery.run();
}

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} filters : key value pairs for filtering
 *
 * Only eq, case sensitive for strings,  doesn't support like
 */
export async function DBgetMany(DB, table, filters) {
	let fields = [];
	let values = [];

	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			fields.push(`${key} = ?`);
			values.push(value);
		});
	}

	let query = `SELECT * FROM ${table} `;
	if (fields.length) {
		query += `WHERE ${fields.join(' AND ')}`;
	}

	let preparedQuery = await DB.prepare(query);

	if (fields.length) {
		preparedQuery = await preparedQuery.bind(...values);
	}

	const { results } = await preparedQuery.run();
	return results;
}

export async function DBdeleteById(DB, id) {
	const query = 'DELETE FROM contacts WHERE id = ?';

	try {
		return await DB.prepare(query).bind(id).run();
	} catch (error) {
		// Code to handle the error
		const niceError = JSON.stringify(error, null, 4);
		console.error('An error occurred:', niceError);
		return niceError;
	}
}
