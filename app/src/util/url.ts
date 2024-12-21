export function isUrlValid( url: string | null ): boolean {
	if ( !url || url === null || url === "" || url === "null" ) return false
	// Validate
	try { new URL( url ) }
	catch ( error ) { return false }

	return true
}