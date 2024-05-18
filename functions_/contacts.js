import { renderTemplate } from '@/utils';

export async function onRequest(context) {
	const { results } = await context.env.DB.prepare('SELECT * FROM contacts').run();
	const data = {
		q: 'John',
		contacts: results,
	};
	const html = await renderTemplate('contacts', data);
	// console.log(results);

	return new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
}
