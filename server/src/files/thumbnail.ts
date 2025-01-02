import sharp from "sharp"
import FfmpegCommand from "fluent-ffmpeg"
import { unlink, readFile, exists, mkdir } from "fs/promises"

import { FileType } from "@argon/data/file"

import { baseDir } from "@argon/util/dir"
import { getFileExtension, getFileName } from "@argon/files/data"
import { getBufferFromBlob } from "@argon/files/conversion"
import { doesFileExist } from "@argon/files/fileSystem"

import { Category, log, Status } from "@argon/util/debug"
import { notifError } from "@argon/notifs/webhook"
import FileNotFoundError from "@argon/errors/FileNotFoundError"

export async function compressImage(
	postId: number, file: File, fileType: FileType,
	quality: number = 75, resolution: number = 250
): Promise<Buffer | null> {
	let fileBuffer: Buffer = await getBufferFromBlob( file )
	if ( fileType === FileType.video ) fileBuffer = await extractVideoFrame( file )
	if ( fileType === FileType.audio ) return null
	try {
		let compressed = await sharp( fileBuffer )
			.webp({ quality })
			.resize( resolution, resolution, { fit: "inside" } )
			.toBuffer()
		return compressed
	} catch ( error: any ) {
		log({
			category: Category.download, status: Status.error,
			newLine: true,
			message: `Failed to compress image: ${ error }`
		})
		await notifError( error )
		return null
	}
}

export async function extractVideoFrame( file: Blob ): Promise<Buffer> {
	// Path
	const name = getFileName( file.name ).replace( /[^a-zA-Z\d]/g, '_' )
	const extension = getFileExtension( file.name )
	const now = Date.now()

	const path = `${ baseDir }/assets/video/${ name }.${ extension }`
	const tempPath = `${ baseDir }/assets/temp/${ now }_${ name }.webp`
	
	// Create temp directory
	const tempDirExists = await exists( `${ baseDir }/assets/temp` )
	if ( !tempDirExists )
		await mkdir( `${ baseDir }/assets/temp` )
	
	log({
		category: Category.download, status: Status.loading,
		newLine: true,
		message: `Extracting video frame for ${ name }.${ extension }...`
	})

	return new Promise( async ( resolve, reject ) => {
		let fileExists: boolean = await doesFileExist( path )
		if ( !fileExists ) {
			let error: FileNotFoundError = new FileNotFoundError(
				path, `Could not find file or directory:\n\`${ path }\``
			)
			log({
				category: Category.download, status: Status.error,
				message: error.message
			})
			notifError(error)
			return reject(error)
		}

		try {
			// Command
			FfmpegCommand( path )
				// Output
				.outputOptions([
					'-vframes 1',
					'-vcodec webp'
				])
				.output( tempPath )

				// Error
				.on( 'error', ( error: Error ) => {
					log({
						category: Category.download, status: Status.error,
						message: error.message
					})
					notifError( error )
					reject( error )
				})
				// Progress
				.on( 'progress', async ( progress ) => {
					log({
						category: Category.download, status: Status.loading,
						message: `Extracting video frame (${ progress.percent }%)`
					})
				})
				// Complete
				.on( 'end', async () => {
					log({
						category: Category.download, status: Status.success,
						message: `Extracted video frame for ${name}.${extension}!`
					})

					const frameBuffer = await readFile( tempPath )
					resolve( frameBuffer )

					unlink( tempPath )
				})
				.run()
		} catch (error: any){
			log({
				category: Category.download, status: Status.error,
				message: error.message
			})
			notifError( error )
			reject( error )
		}
	})
}