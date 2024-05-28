/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} obj : key value pairs for insertion
 * Could add  " RETURNING * " at the end of the query if I want to return new ID/etc
 */
async function insertOne(DB, table, obj) {
	let fields = [];
	let values = [];

	Object.entries(obj).forEach(([key, value]) => {
		fields.push(key);
		values.push(value);
	});

	let query = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${Array(fields.length).fill('?').join(', ')})`;
	const preparedQuery = DB.prepare(query).bind(...values);
	const { results } = await runQuery(preparedQuery);
	return results;
}

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} obj : key value pairs for update
 * @param {string|number} id : the id of the record to be updated
 */
async function updateOne(DB, table, obj, id) {
	let fields = [];
	let values = [];

	Object.entries(obj).forEach(([key, value]) => {
		fields.push(`${key} = ?`);
		values.push(value);
	});

	values.push(id);

	const query = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`;

	const preparedQuery = await DB.prepare(query).bind(...values);
	const { results } = await runQuery(preparedQuery);
	return results;
}

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string} table : table name
 * @param {Object} filters : key value pairs for filtering
 *
 * Only eq, case sensitive for strings,  doesn't support like
 */
async function getMany(DB, table, filters) {
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

	const { results } = await runQuery(preparedQuery);
	return results;
}

/**
 *
 * @param {Object} DB : binding to a D1 database
 * @param {string|number} id : the id of the record to be deleted
 * @returns
 */
async function deleteById(DB, id) {
	const query = 'DELETE FROM contacts WHERE id = ?';
	const preparedQuery = DB.prepare(query).bind(id);
	const { results } = await runQuery(preparedQuery);
	return results;
}

/**
 *
 * @param {Object} preparedQuery : a prepared query created with DB.prepare()
 * @returns
 */
async function runQuery(preparedQuery) {
	try {
		return await preparedQuery.run();
	} catch (error) {
		const niceError = JSON.stringify(error, null, 4);
		console.error('A DB error occurred:', niceError);
		// return niceError;
	}
}

const DB = {
	deleteById,
	insertOne,
	getMany,
	updateOne,
	runQuery,
};

export default DB;
