export function isUrlValid( url: string | null ): boolean {
	if ( !url || url === null || url === "" || url === "null" ) return false
	// Validate
	try { new URL( url ) }
	catch ( error ) { return false }

	return true
}

export function getUrlDomain( url: string | null ): string | null {
	if ( !url || !isUrlValid( url ) ) return null
	const components = new URL( url ).host.split( '.' )
	return components[ components.length - 2 ]
}