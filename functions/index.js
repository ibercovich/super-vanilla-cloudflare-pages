import { renderTemplate, html } from './src/utils.js';
import * as T from './src/templates/.gen.js';
// import * as Routes from './src/routes/.gen.js';

export async function onRequest(context) {
	console.log(context.env);

	const content = html`
		<main class="section">
			<div class="container" id="content">
				<a href="/contacts">Get The Contacts</a>
			</div>
		</main>
	`;
	return renderTemplate({ title: 'Super Vanilla' }, { content }, context);
}
