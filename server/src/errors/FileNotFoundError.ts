export default class FileNotFoundError extends Error {
	path: string
	constructor( path: string, message?: string ) {
		super(message, { cause: `\`${ path }\` doesn't exist, genius` })
		this.path = path
	}
}