import { useState } from "react"
import type { DragEvent, ClipboardEvent } from "react"

import type { Value } from "node_modules/react-datetime-picker/dist/cjs/shared/types"
import { FileType, type Tag } from "@argon/util/types"

import { upload } from "@argon/util/api"
import { tagsToString } from "@argon/util/tag"
import { getUrlDomain } from "@argon/util/url"
import { getBlueskyPost } from "@argon/util/apis/bluesky"

import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import FileUpload from "@argon/components/upload/FileUpload.tsx"
import Text from "@argon/components/input/Text.tsx"
import Timestamp from "@argon/components/input/Timestamp.tsx"
import Tags from "@argon/components/tag/TagInput.tsx"

import "react-tabs/style/react-tabs.css"
import "@argon/components/upload/post-upload.css"
import "@argon/globals.css"

enum SourceType {
	None,
	Discord,
	Twitter,
	BlueSky
}

export default function PostUpload() {

	const [ title, setTitle ] = useState<string>( "" )
	const [ timestamp, setTimestamp ] = useState<number>( new Date().getTime() )
	const [ sourceUrl, setSourceUrl ] = useState<string>( "" )

	const [ fileUrl, setFileUrl ] = useState<string>( "" )
	const [ thumbnailUrl, setThumbnailUrl ] = useState<string>( "" )
	const [ projectUrl, setProjectUrl ] = useState<string>( "" )

	const [ file, setFile ] = useState<File | null>()
	const [ thumbnailFile, setThumbnailFile ] = useState<File | null>()
	const [ projectFile, setProjectFile ] = useState<File | null>()

	const [ tags, setTags ] = useState<Tag[]>( [] )

	const [ uploading, setUploading ] = useState<boolean>( false )

	const [ lastModified, setLastModified ] = useState<number>( 0 )
	const [ sourceType, setSourceType ] = useState<SourceType>()

	function uploadPost() {
		if ( !file && ( !fileUrl || fileUrl == "" ) ) return alert( "You must provide a file" )

		setUploading( true )

		let formdata = new FormData()
		if (file) formdata.append( 'file', file )
		if (fileUrl) formdata.append( 'fileUrl', fileUrl )
			
		if (thumbnailFile) formdata.append( 'thumbnailFile', thumbnailFile )
		if (thumbnailUrl) formdata.append( 'thumbnailUrl', thumbnailUrl )
			
		if (projectFile) formdata.append( 'projectFile', projectFile )
		if (projectUrl) formdata.append( 'projectUrl', projectUrl )
		
		if (title) formdata.append( 'title', title )
		if (timestamp) formdata.append( 'timestamp', timestamp.toString() )
		if (sourceUrl) formdata.append( 'sourceUrl', sourceUrl )
		if (tags) formdata.append( 'tags', tagsToString(tags) )

		upload(null, `post/upload`, formdata, async ( response: Response, status: number ) => {
			setUploading( false )
			if ( status === 413 ) alert(
				`The file size exceeds the 4.5MB limit!\n`
				+ `Unfortunately, this is a limitation of Vercel, not Argon.\n`
				+ `Try uploading the file on Discord and using it's link instead to work around this!`
			)

			let res = await response.json()
			if ( res?.error ) alert( res?.error )
			else window.location.href = `/`
		})
	}

	return (
		<div className="post-upload">
			<div className="upload-side" id="left">
				<div className="upload-field section" id="post-details">
					{ /* Title */ }
					<h2>Title</h2>
					<Text resetButton={ false } onChange={ setTitle }/>
					
					{ /* Timestamp */ }
					<h2>Created</h2>
					<Timestamp currentTimestamp={ timestamp } resetButton={ false } onChange={ updateTimestamp }/>
					
					<div className="buttons" id="timestamp-buttons">
						{ lastModified > 0 &&
							<button className="button focusable text accent" id="timestamp-file"
							onClick={ () => { setTimestamp( lastModified ) } }>
								Get from File
							</button>
						}
						{ sourceType === SourceType.Discord &&
							<button className="button focusable text accent" id="timestamp-discord"
							onClick={ () => { setTimestamp( getTimestampFromDiscordUrl( sourceUrl ) ) } }>
								Get from Discord ID
							</button>
						}
						{ sourceType === SourceType.Twitter &&
							<button className="button focusable text accent" id="timestamp-twitter"
							onClick={ () => { setTimestamp( getTimestampFromTwitterId( sourceUrl ) ) } }>
								Get from Twitter ID
							</button>
						}
						{ sourceType === SourceType.BlueSky &&
							<button className="button focusable text accent" id="timestamp-bluesky"
							onClick={ async () => { setTimestamp( await getTimestampFromBluesky( sourceUrl ) ) } }>
								Get from Bluesky Post
							</button>
						}
					</div>

					{ /* Source URL */ }
					<h2>Source URL</h2>
					<Text resetButton={ false } onChange={ updateSourceUrl }/>

					{ /* Tags */ }
					<h2>Tags</h2>
					<Tags
						search={ false }
						multiline={ true }
						onChange={ updateTags }
					/>
				</div>
			</div>

			<div className="upload-side" id="right">
				<div className="upload-field section" id="post-upload-file">
					<Tabs>
						<TabList>
							<Tab className="button text accent focusable center">File</Tab>
							<Tab className="button text accent focusable center">Thumbnail</Tab>
							<Tab className="button text accent focusable center">Project File</Tab>
						</TabList>

						{ /* File */ }
						<TabPanel
							forceRender={ true }
							onDragOver={ ( event ) => { event.preventDefault() } }
							onDrop={ ( event ) => onFileDrop( event, ( draggedFile: File | null ) => {
								if ( draggedFile ) setFile( draggedFile )
							})}
							onPaste={ ( event ) => onFilePaste( event, ( pastedFile: File | null ) => {
								if ( pastedFile ) setFile( pastedFile )
							})}
						>
							<FileUpload
								name='File'
								limitTo={ FileType.unknown }
								currentFile={ file }
								updateFile={ updateFile }
								currentUrl={ fileUrl }
								updateUrl={ updateFileUrl }
							/>
						</TabPanel>
						
						{ /* Thumbnail */ }
						<TabPanel
							forceRender={ true }
							onDragOver={ ( event ) => { event.preventDefault() } }
							onDrop={ ( event ) => onFileDrop( event, ( draggedFile: File | null ) => {
								if ( draggedFile ) setThumbnailFile( draggedFile )
							})}
							onPaste={ ( event ) => onFilePaste( event, ( pastedFile: File | null ) => {
								if ( pastedFile ) setThumbnailFile( pastedFile )
							})}
						>
							<FileUpload
								name='Thumbnail'
								limitTo={ FileType.image }
								currentFile={ thumbnailFile }
								updateFile={ updateThumbnail }
								currentUrl={ thumbnailUrl }
								updateUrl={ updateThumbnailUrl }
							/>
						</TabPanel>
						
						{ /* Project File */ }
						<TabPanel
							forceRender={ true }
							onDragOver={ ( event ) => { event.preventDefault() } }
							onDrop={ ( event ) => onFileDrop( event, ( draggedFile: File | null ) => {
								if ( draggedFile ) setProjectFile( draggedFile )
							})}
							onPaste={ ( event ) => onFilePaste( event, ( pastedFile: File | null ) => {
								if ( pastedFile ) setProjectFile( pastedFile )
							})}
						>
							<FileUpload
								name='Project File'
								limitTo={ FileType.project }
								currentFile={ projectFile }
								updateFile={ updateProjectFile }
								currentUrl={ projectUrl }
								updateUrl={ updateProjectUrl }
							/>
						</TabPanel>
					</Tabs>
				</div>
			</div>

			<div className="upload-menu pop-up">
				<button
					className={ `button nav-button focusable ${ uploading && 'disabled' }` } id="upload-post"
					onClick={ uploadPost } disabled={ uploading }
				>
					<img className="button-icon" src="/icons/nav/save.svg" title='Upload'/>
				</button>
				<button className="button focusable nav-button" id="cancel-post"
					onClick={ () => window.location.href = "/" }
				>
					<img className="button-icon" src="/icons/nav/cancel.svg" title='Cancel'/>
				</button>
			</div>
		</div>
	)

	// Files
	function updateFile(file: File | null) {
		setFile(file)
		setLastModified( file?.lastModified ?? 0 )
	}
	function updateThumbnail(file: File | null) {
		setThumbnailFile(file)
	}
	function updateProjectFile(file: File | null) {
		setProjectFile(file)
	}

	function onFileDrop( event: DragEvent<HTMLDivElement>, callback: ( draggedFile: File | null ) => void ) {
		event.preventDefault()
		// Get dragged file
		const files = event.dataTransfer?.files
		const draggedFile = files?.item( 0 )
		// Callback
		callback( draggedFile )
	}

	function onFilePaste( event: ClipboardEvent<HTMLDivElement>, callback: ( pastedFile: File | null ) => void ) {
		const items = event.clipboardData.items
		let pastedFile = null
		// Search for image in clipboard
		for ( let item of items ) {
			if ( item.kind === 'file' ) { pastedFile = item.getAsFile(); break }
		}
		// Callback
		callback( pastedFile )
	}

	// File Urls
	function updateFileUrl( url: string | null ) { setFileUrl( url || "" ) }
	function updateThumbnailUrl( url: string | null ) { setThumbnailUrl( url || "" ) }
	function updateProjectUrl( url: string | null ) { setProjectUrl( url || "" ) }

	// Source URL
	function updateSourceUrl( url: string | null ) {
		setSourceUrl( url || "" )
		let host = getUrlDomain( url )
		switch ( host ) {
			case 'discord': setSourceType( SourceType.Discord ); break;
			case 'twitter':
			case 'x': setSourceType( SourceType.Twitter ); break;
			case 'bsky': setSourceType( SourceType.BlueSky ); break;
			default: setSourceType( SourceType.None ); break;
		}
	}

	// Tags
	function updateTags( tags: Tag[] ) { setTags( tags ) }

	// Timestamp
	function updateTimestamp( value: Value ) { if ( value ) setTimestamp( value.getTime() ) }

	function getTimestampFromDiscordUrl( url: string ): number {
		let id = url.split( '/' ).pop()?.split( '?' )[0]
		let binarySnowflake = parseInt( id || '0', 10 ).toString( 2 )
		if ( binarySnowflake.length < 64 ) {
			let diff = 64 - binarySnowflake.length
			for ( let i = 0; i < diff; i++ ) {
				binarySnowflake = '0' + binarySnowflake
			}
		}
		let timestamp = parseInt( binarySnowflake.substring( 0, 42 ), 2 ) + 1420070400000
		return timestamp
	}

	async function getTimestampFromBluesky( url: string ): Promise<number> {
		const post = await getBlueskyPost( url )
		const time = ( post?.thread?.post as any )?.record?.createdAt
		if ( time ) return new Date( time ).getTime()
		else return 0
	}

	function getTimestampFromTwitterId( url: string ): number {
		let id = Number( url.split( '/' ).pop()?.split( '?' )[0] )
		const offset = 1288834974657
		return new Date ( ( id / 2 ** 22 ) + offset ).getTime()
	}
}