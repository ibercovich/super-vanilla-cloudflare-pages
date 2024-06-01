import { renderTemplate, html } from '@/utils';
import * as T from '@/templates/.gen';
// import * as Routes from '@/routes/.gen';

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
