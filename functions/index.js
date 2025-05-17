import { renderTemplate } from './src/utils.js';
import * as T from './src/templates/.gen.js';
// import * as Routes from './src/routes/.gen.js';

export async function onRequest(context) {
	console.log(context.env);

	return renderTemplate({ title: 'Super Vanilla - Home' }, { content: T.home }, context);
}
