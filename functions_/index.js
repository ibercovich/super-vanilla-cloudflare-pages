import { renderTemplate } from '@/utils';
// import * as Routes from '@/routes/.gen';

export async function onRequest(context) {
	return await renderTemplate();
}
