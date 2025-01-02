import { existsSync } from "fs"
import { unlink, lstat, rm } from "fs/promises"

import { baseDir } from "@argon/util/dir"
import { FileData, getFileType } from "@argon/files/data"
import { getBlobFromBuffer } from "@argon/files/conversion"

import { log, Category, Status } from "@argon/util/debug"
import { notifError } from "@argon/notifs/webhook"

export async function doesFileExist(path: string): Promise<boolean> {
	return await lstat(path).then(() => true).catch(() => false)
}

export async function writeFileToDisk( data: Blob, fileData: FileData ) {
	let fileType = fileData.type ?? getFileType( `${ fileData.name }.${ fileData.extension }` )
	let path = `${ baseDir }/assets/${ fileType }/${ fileData.name }.${ fileData.extension }`
	await Bun.write( path, data )
}

export async function downloadFile( file: Blob | Buffer, fileData: FileData ) {
	if ( !file ) return
	log({
		category: Category.download, status: Status.loading,
		newLine: true,
		message: `Downloading ${ fileData.type === 'thumbnail' ? 'thumbnail for ' : '' }${ fileData.name }.${ fileData.extension }...`
	})

	let extension = fileData.type === 'thumbnail' ? 'webp' : fileData.extension
	let dataReal = { name: fileData.name, extension, type: fileData.type } as FileData

	if ( file instanceof Buffer ) file = getBlobFromBuffer( file as Buffer )
	await writeFileToDisk( file, dataReal )

	log({
		category: Category.download, status: Status.success,
		message: `Downloaded ${ fileData.type === 'thumbnail' ? 'thumbnail for ' : '' }${ fileData.name }.${ fileData.extension }!`
	})
}

export async function replaceFile(
	postId: number, file: Blob | Buffer,
	previousFileData: FileData, fileData: FileData
) {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: `Replacing File for Post #${ postId }...`
	})

	// Delete old file
	deleteFile( postId, previousFileData )

	// Download new file
	await downloadFile( file, fileData )

	log({
		category: Category.database, status: Status.success,
		message: `Replaced File for Post #${ postId }!`
	})
}

export async function deleteFile( postId: number, fileData: FileData ) {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: `Deleting File for Post #${ postId }...`
	})
	
	let fileType = fileData.type ?? getFileType( `${ fileData.name }.${ fileData.extension }` )
	let path = `${ baseDir }/assets/${ fileType }/${ postId }_${ fileData.name }.${ fileData.extension }`
	if ( existsSync( path ) ) {
		await unlink( path )
		log({
			category: Category.database, status: Status.success,
			message: `Deleted ${ postId }_${ fileData.name }.${ fileData.extension } for Post #${ postId }!`
		})
	} else {
		log({
			category: Category.database, status: Status.error,
			message: `The ${ postId }_${ fileData.name }.${ fileData.extension } for Post #${ postId } does not exist!`
		})
	}
}

export async function clearFiles() {
	for ( let fileType of [ "image", "video", "audio", "thumbnail", "project", "temp", "unknown" ] ) {
		let path = `${baseDir}/assets/${ fileType }`
		let exists = await doesFileExist( path )
		if ( exists ) {
			try {
				rm( path, { recursive: true, force: true } ).then(() => {
					log({
						category: Category.download, status: Status.success,
						message: `Cleared ${ fileType } files!`
					})
				})
			} catch ( error: any ) {
				log({
					category: Category.download, status: Status.error,
					message: error.message
				})
				notifError( error )
			}
		}
	}
}