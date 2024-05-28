import DB from '@/db';

export async function onRequestGet(context) {
	const result1 = await DB.insertOne(context.env.DB, 'contacts', getTestContact());

	const result2 = await DB.updateOne(context.env.DB, 'contacts', getTestContact(), '3');

	const response = { 'Insert Test': result1, 'Update Test': result2 };

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
