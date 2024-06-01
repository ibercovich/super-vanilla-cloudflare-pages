import { DB, DBService } from '@/db';

export async function onRequestGet(context) {
	const _DB = new DBService(context.env.DB);

	const result1 = await _DB.insertOne('contacts', getTestContact());

	const result2 = await _DB.updateOne('contacts', getTestContact(), { id: 3 });

	const result3 = await _DB.queryAll('contacts');

	const response = { 'Insert Test': result1, 'Update Test': result2, 'Query All Test': result3 };

	return new Response(JSON.stringify(response, null, 4));
}

function getTestContact() {
	return {
		first_name: 'Tasty',
		last_name: 'McTesteess',
		email: 'tasty@testees.yum' + Math.floor(Math.random() * 100).toString(),
		phone: '66667-5555-577' + Math.floor(Math.random() * 100).toString(),
	};
}
