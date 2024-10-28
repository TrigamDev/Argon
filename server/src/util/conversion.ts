import { PassThrough, Readable } from "stream"

export function bufferToReadStream(buffer: Buffer): Readable {
	let stream = new PassThrough()
	stream.write(buffer)
	stream.end()
	return stream
}