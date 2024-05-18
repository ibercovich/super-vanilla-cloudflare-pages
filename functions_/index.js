import { renderTemplate } from '@/utils';
// import * as Routes from '@/routes/.gen';

export async function onRequest(context) {
	return new Response(await renderTemplate(), {
		headers: { 'Content-Type': 'text/html' },
	});
}
