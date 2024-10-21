import type { APIRoute } from "astro";

const getProxyUrl = (request: Request) => {
	const proxyUrl = new URL("https://argonapi.trigam.dev")
	const requestUrl = new URL(request.url.replace(/\/api/, ''))

	return new URL(requestUrl.pathname, proxyUrl)
};

export const ALL: APIRoute = async ({ request }) => {
	const proxyUrl = getProxyUrl(request)
	const response = await fetch(proxyUrl.href, request)
	return new Response(response.body)
};