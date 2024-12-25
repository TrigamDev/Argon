import { Context } from "elysia"
import { fileURLToPath } from "url"
const baseDir = fileURLToPath(import.meta.url).replace(/\\/g, '/').replace('/src/util/dir.ts', '')

export { baseDir }

export function getWebPath(context: Context): string {
	if (!context) return ""

	const origin: string | null = context.request.headers.get( 'origin' )
	let host = context.headers.host
	let port = process.env.PORT

	let protocol: string | null = null
	if ( !protocol ) protocol = getProtocolFromUrl( origin )
	if ( !protocol ) protocol = context.request.headers.get( 'x-forwarded-protocol' )

	// Attempt to get from headers
	const url = `${protocol ?? 'http'}://${host ?? `localhost:${port}`}`
	console.log(url)
	return url
}

export function getProtocolFromUrl ( url: string | null ): string | null {
	if ( !url ) return null
	return url.split('://')[0]
}