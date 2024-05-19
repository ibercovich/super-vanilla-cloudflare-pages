import { DBinsertOne, DBupdateOne } from '@/utils';

export async function onRequestGet(context) {
	const result1 = await DBinsertOne(context.env.DB, 'contacts', getTestContact());

	const result2 = await DBupdateOne(context.env.DB, 'contacts', getTestContact(), '3');

	const response = { 'Insert Test': result1, 'Update Test': result2 };

	return new Response(JSON.stringify(response, null, 4));
}

function getTestContact() {
	return {
		first_name: 'Tasty',
		last_name: 'McTest',
		email: 'tasty@test.yum' + Math.floor(Math.random() * 100).toString(),
		phone: '666-555-57' + Math.floor(Math.random() * 100).toString(),
	};
}
