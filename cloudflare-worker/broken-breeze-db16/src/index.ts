/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
// import { createClient } from '@supabase/supabase-js';

interface Env {
	MY_BUCKET: R2Bucket;
	AUTH_SECRET: string;
	// SUPABASE_URL: string;
	// SUPABASE_KEY: string;
}

export default {
	async fetch(request, env): Promise<Response> {
		// Note that you could require authentication for all requests
		// by moving this code to the top of the fetch function.
		const auth = request.headers.get('Authorization');
		const expectedAuth = `Bearer ${env.AUTH_SECRET}`;

		if (!auth || auth !== expectedAuth) {
			return new Response('Unauthorized', { status: 401 });
		}

		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		// const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

		if (request.method === 'PUT') {
			await env.MY_BUCKET.put(key, request.body);
			// await supabase
			// 	.from("profiles")
			// 	.select("credits")
			// 	.eq('id', key.split('/')[0])
			// 	.single();


			return new Response(`Object ${key} uploaded successfully!`);
		}

		if (request.method === 'GET') {
			const object = await env.MY_BUCKET.get(key);

			if (object === null) {
				return new Response('Object Not Found', { status: 404 });
			}

			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);

			return new Response(object.body, {
				headers,
			});
		}

		return new Response('Method Not Allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;
