import Mustache from 'mustache';
import * as Templates from '@/templates/.gen';

export async function renderTemplate(name, data) {
	let tpl = '';
	if (name in Templates) {
		tpl = Templates[name];
	}
	const html = await Mustache.render(Templates['index'], data, { content: tpl });
	return html;
}
