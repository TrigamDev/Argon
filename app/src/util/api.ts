import type { Post } from "./types"

// Get client IP address (used for verification)
export async function getIpAddress(): Promise<string | null> {
	const response = await fetch('http://ip-api.com/json')
	if (!response.ok) { return null }
	const data = await response.json()
	return data.query
	
}
// Routes
export async function getPostById(request: Request, id: number): Promise<Post | null> {
	return get<Post>(request, `post/${id}`, async (response: Response) => {
		const post: Post = await response.json()
		return post
	})
}
export async function getPosts(request: Request): Promise<Post[] | null> {
	return post<Post[]>(request, 'search', {}, async (response: Response) => {
		const posts: Post[] = await response.json()
		return posts
	})
}


// Utils
export async function get<T>(request: Request, endpoint: string, callback: CallableFunction): Promise<T | null> {
	const ip = await getIpAddress()
	const origin = new URL(request.url).origin
	const response = await fetch(`${origin}/api/${endpoint}`, {
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"X-Forwarded-For": ip ?? '',
			... request.headers,
		},
	})
	if (!response || !response?.ok) { return null }
	return callback(response)
}

export async function post<T>(request: Request, endpoint: string, data: {}, callback: CallableFunction): Promise<T | null> {
	const ip = await getIpAddress()
	const origin = new URL(request.url).origin
	const body = JSON.stringify(data)
	const response = await fetch(`${origin}/api/${endpoint}`, {
		method: 'POST',
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"X-Forwarded-For": ip ?? '',
			... request.headers,
		},
		body: body
	})
	if (!response || !response?.ok) { return null }
	return callback(response)

}

// export async function apiUpload(endPoint: string, body: any) {
//     let currentUrl = window.location.href.split("/")
//     let fetchUrl = currentUrl[0] + "//" + currentUrl[2] + `/api/${endPoint}`
//     const response = await fetch(fetchUrl, {
//         method: 'POST',
//         headers: {
//             'Access-Control-Allow-Origin': '*'
//         },
//         body: body
//     })
//     return await response.json()
// }