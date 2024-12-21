import type { Post, Tag } from "./types"

// Get client IP address (used for verification)
export async function getIpAddress(): Promise<string | null> {
	// const response = await fetch('http://ip-api.com/json')
	// if (!response.ok) { return null }
	// const data = await response.json()
	// return data.query
	return '0.0.0.1'
}
// Routes
export async function getPostById(request: Request, id: number): Promise<Post | null> {
	if ( isNaN(id) ) return null
	return get<Post>(request, `post/${id}`, async (response: Response) => {
		const post: Post = await response.json()
		return post
	})
}
export async function getPosts(request: Request, tags: Tag[]): Promise<Post[] | null> {
	return post<Post[]>(request, 'search', {
		tags: tags ?? []
	}, async (response: Response) => {
		const posts: Post[] = await response.json()
		return posts
	})
}


// Utils
export async function get<T>(request: Request | null, endpoint: string, callback: CallableFunction): Promise<T | null> {
	const ip = await getIpAddress()
	const origin = getOrigin(request)

	let headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"X-Forwarded-For": ip ?? '',
		"X-Forwarded-Protocol": getProtocol(request)
	}
	if (request?.headers) headers = { ...headers, ...request.headers }

	const response = await fetch(`${origin}/api/${endpoint}`, {
		credentials: "same-origin",
		headers: headers,
	})

	if (!response || !response?.ok) { return null }
	return callback(response)
}

export async function post<T>(request: Request | null, endpoint: string, data: {}, callback: CallableFunction): Promise<T | null> {
	const ip = await getIpAddress()
	const origin = getOrigin(request)

	let headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"X-Forwarded-For": ip ?? '',
		"X-Forwarded-Protocol": getProtocol(request)
	}
	if (request?.headers) headers = { ...headers, ...request.headers }

	const body = JSON.stringify(data)

	const response = await fetch(`${origin}/api/${endpoint}`, {
		method: "POST",
		credentials: "same-origin",
		headers: headers,
		body: body
	})
	
	if (!response || !response?.ok) { return null }
	return callback(response)
}

export async function upload<T>(request: Request | null, endpoint: string, data: FormData, callback: CallableFunction): Promise<T | null> {
	const ip = await getIpAddress()
	const origin = getOrigin(request)

	let headers = {
		"Access-Control-Allow-Origin": "*",
		"X-Forwarded-For": ip ?? '',
		"X-Forwarded-Protocol": getProtocol(request)
	}
	if (request?.headers) headers = { ...headers, ...request.headers }

	const response = await fetch(`${origin}/api/${endpoint}`, {
		method: "POST",
		credentials: "same-origin",
		headers: headers,
		body: data
	})
	
	if (!response || !response?.ok) { return null }
	return callback(response)
}

function getOrigin (request: Request | null) {
	if (request) return new URL(request.url).origin
	else {
		let currentUrl = window.location.href.split("/")
		return currentUrl[0] + "//" + currentUrl[2]
	}
}

function getProtocol (request: Request | null) {
	if (request) return new URL(request.url).protocol
	else {
		let currentUrl = window.location.href.split("://")
		return currentUrl[0]
	}
}