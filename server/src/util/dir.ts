import { Context } from 'elysia'
import { fileURLToPath } from 'url'
const baseDir = fileURLToPath(import.meta.url).replace(/\\/g, '/').replace('/src/util/dir.ts', '')

export { baseDir }

export function getWebPath(context: Context): string {
	if (!context) return ""

	// Attempt to get from Elysia path
	let path = (context as any).path

	// Attempt to get from headers
	const protocol = context.request.headers.get('x-forwarded-proto') ?? 'http'
	const url = `${protocol ?? 'http'}://${context.request.headers.get('host') ?? path}`
	return url
}