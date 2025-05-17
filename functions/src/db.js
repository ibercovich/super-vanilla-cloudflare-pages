export class DBService {
	constructor(dbConnection) {
		this.db = dbConnection;
		// Ensures #runQuery always has the correct this
		this.runQuery = this.runQuery.bind(this);
	}

	async runQuery(query, params = []) {
		try {
			let preparedQuery = this.db.prepare(query);
			preparedQuery = preparedQuery.bind(...params);
			const { results } = await preparedQuery.run(); //bind(...params).
			return results;
		} catch (error) {
			const niceError = JSON.stringify(error, null, 4);
			console.error('A DB error occurred:', niceError);
			throw new Error('Failed to execute query');
		}
	}

	#_placeholders(data) {
		// private method
		const keys = Object.keys(data);
		const values = Object.values(data);
		const placeholders = keys.map(() => '?').join(', ');
		const keyValuePairs = keys.map((key) => `${key} = ?`); // Array of 'key = ?' strings
		return { keys, values, placeholders, keyValuePairs };
	}

	/**
	 *
	 * @param {String} table
	 * @param {Object} data
	 * @returns
	 */
	async insertOne(table, data) {
		const { keys, values, placeholders } = this.#_placeholders(data);
		const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
		return await this.runQuery(query, values);
	}

	/**
	 *
	 * @param {String} table
	 * @param {Object} data : key-value pairs for SET clause
	 * @param {Object} idObj : {idCol: idVal}
	 * @returns
	 */
	async updateOne(table, data, idObj) {
		const { values, keyValuePairs } = this.#_placeholders(data);
		const [idCol, idVal] = Object.entries(idObj)[0];
		const query = `UPDATE ${table} SET ${keyValuePairs.join(', ')} WHERE ${idCol} = ? RETURNING *`;
		return await this.runQuery(query, [...values, idVal]);
	}

	/**
	 *
	 * @param {String} table
	 * @param {Object} conditions : key-value pairs for Where clause
	 * @param {number} limit
	 * @returns
	 */
	async queryAll(table, conditions = {}, limit = 1000) {
		const { keys, values, keyValuePairs } = this.#_placeholders(conditions);
		let query = `SELECT * FROM ${table}`;
		if (keys.length) {
			query += ` WHERE ${keyValuePairs.join(' AND ')}`;
		}
		query += ` LIMIT ${limit}`;
		return await this.runQuery(query, values);
	}

	/**
	 *
	 * @param {String} table : table name
	 * @param {Object} idObj : {idCol: idVal}
	 * @returns
	 */
	async deleteById(table, idObj) {
		const [idCol, idVal] = Object.entries(idObj)[0];
		const query = `DELETE FROM ${table} WHERE ${idCol} = ? RETURNING *`;
		return await this.runQuery(query, [idVal]);
	}

	// async updateAll(table, data, conditions = {}) {
	// 	const _data = this.#_placeholders(data);
	// 	const _conditions = this.#_placeholders(conditions);

	// 	let query = `UPDATE ${table} SET ${_data.keyValuePairs.join(', ')}`;
	// 	if (_conditions.values.length) {
	// 		query += ` WHERE ${_conditions.keyValuePairs.join(' AND ')}`;
	// 	}
	// 	return await this.runQuery(query, [..._data.values, ..._conditions.values]);
	// }
}
