import { Context } from 'elysia'
import { fileURLToPath } from 'url'
const baseDir = fileURLToPath(import.meta.url).replace(/\\/g, '/').replace('/src/util/dir.ts', '')

export { baseDir }

export function getWebPath(context: Context): string {
	if (!context) return ""

	let protocol: string | null = context.request.headers.get('X-Forwarded-Protocol')
	let host = context.headers.host
	let port = process.env.PORT

	// Attempt to get from headers
	const url = `${protocol ?? 'http'}://${host ?? `localhost:${port}`}`
	console.log(url)
	return url
}