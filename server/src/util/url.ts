/**
 * Returns whether the URL is a valid URL
 * @param { string | null | undefined } url The Url to get validate
 * @returns { URL | null } Either the Url or null
 */
export function validateUrl(url: string | null | undefined): URL | null {
	let isUrlValid = url && url != undefined && url != null && url != "" && url != "null"
	if ( !isUrlValid ) return null
	// Validate
	try { return new URL( url as string ) }
	catch ( error ) { return null }
}