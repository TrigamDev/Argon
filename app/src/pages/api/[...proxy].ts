import type { APIRoute } from "astro";

const getProxyUrl = (request: Request) => {
	const serverUrl = import.meta.env.SERVER_URL
	if (!serverUrl) return null
	const proxyUrl = new URL(serverUrl)
	const requestUrl = new URL(request.url.replace(/\/api/, ''))

	return new URL(requestUrl.pathname, proxyUrl)
};

export const ALL: APIRoute = async ({ request }) => {
	const proxyUrl = getProxyUrl(request)
	if (!proxyUrl) return new Response()
	const response = await fetch(proxyUrl.href, request)
	return new Response(response.body)
};