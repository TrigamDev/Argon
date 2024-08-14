import { PassThrough, Readable } from "stream"
import FfmpegCommand from 'fluent-ffmpeg'

export function bufferToReadStream(buffer: Buffer): Readable {
	let stream = new PassThrough()
	stream.write(buffer)
	stream.end()
	return stream
}