import { BunFile } from "bun"
import { PassThrough, Readable } from "stream"

export function getStreamFromBuffer(buffer: Buffer): Readable {
	let stream = new PassThrough()
	stream.write(buffer)
	stream.end()
	return stream
}

export async function getBufferFromBlob(blob: Blob | Buffer): Promise<Buffer> {
	if (!blob || (blob instanceof Blob && !blob.arrayBuffer)) return Buffer.of()
	if (blob instanceof Buffer) return blob
	return Buffer.from(await blob.arrayBuffer())
}

export async function getFileFromBunFile(file: BunFile, name?: string): Promise<File | null> {
	let exists: boolean = await file.exists()
	if (!exists) return null
	let arrayBuffer: ArrayBuffer = await file.arrayBuffer()
	let fileBuffer: Buffer = await getBufferFromBlob(Buffer.from(arrayBuffer))
	return new File([fileBuffer], file.name ?? name ?? 'file')
}

export function getFileFromBuffer(buffer: Buffer, name?: string | null): File {
	return new File([buffer], name ?? '')
}

export async function getFileFromBlob(blob: Blob, name?: string | null): Promise<File> {
	let buffer: Buffer = Buffer.from(await blob.arrayBuffer())
	return getFileFromBuffer(buffer, name)
}

export function getBlobFromBuffer( buffer: Buffer ): Blob {
	return new Blob([ buffer ])
}

export function bufferToReadStream( buffer: Buffer ): Readable {
	let stream = new PassThrough()
	stream.write( buffer )
	stream.end()
	return stream
}