import { useState } from "react"

import type { Value } from "node_modules/react-datetime-picker/dist/cjs/shared/types"
import { FileType, type Tag } from "@argon/util/types"

import { upload } from "@argon/util/api"
import { tagsToString } from "@argon/util/tag"
import { getUrlDomain } from "@argon/util/url"

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
	BlueSky,
	Tumblr,
	PixilArt
}

export default function PostUpload() {

	const [title, setTitle] = useState<string>("")
	const [timestamp, setTimestamp] = useState<number>(new Date().getTime())
	const [sourceUrl, setSourceUrl] = useState<string>("")

	const [fileUrl, setFileUrl] = useState<string>("")
	const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
	const [projectUrl, setProjectUrl] = useState<string>("")

	const [file, setFile] = useState<File | null>()
	const [thumbnailFile, setThumbnailFile] = useState<File | null>()
	const [projectFile, setProjectFile] = useState<File | null>()

	const [tags, setTags] = useState<Tag[]>([])

	const [ uploading, setUploading ] = useState<boolean>( false )

	const [ lastModified, setLastModified ] = useState<number>( 0 )
	const [ sourceType, setSourceType ] = useState<SourceType>()

	function uploadPost() {
		if (!file && (!fileUrl || fileUrl == "")) return alert("You must provide a file")

		setUploading( true )

		let formdata = new FormData()
		if (file) formdata.append('file', file)
		if (fileUrl) formdata.append('fileUrl', fileUrl)
			
		if (thumbnailFile) formdata.append('thumbnailFile', thumbnailFile)
		if (thumbnailUrl) formdata.append('thumbnailUrl', thumbnailUrl)
			
		if (projectFile) formdata.append('projectFile', projectFile)
		if (projectUrl) formdata.append('projectUrl', projectUrl)
		
		if (title) formdata.append('title', title)
		if (timestamp) formdata.append('timestamp', timestamp.toString())
		if (sourceUrl) formdata.append('sourceUrl', sourceUrl)
		if (tags) formdata.append('tags', tagsToString(tags))

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
					<Text resetButton={false} onChange={setTitle}/>
					
					{ /* Timestamp */ }
					<h2>Created</h2>
					<Timestamp currentTimestamp={ timestamp } resetButton={false} onChange={updateTimestamp}/>
					
					<div className="buttons" id="timestamp-buttons">
						{ lastModified > 0 &&
							<button className="button focusable text accent" id="timestamp-file"
							onClick={() => { setTimestamp( lastModified ) }}>
								Get from File
							</button>
						}
						{ sourceType === SourceType.Discord &&
							<button className="button focusable text accent" id="timestamp-discord"
							onClick={() => { setTimestamp( getTimestampFromDiscordUrl( sourceUrl ) ) }}>
								Get from Discord ID
							</button>
						}
					</div>

					{ /* Source URL */ }
					<h2>Source URL</h2>
					<Text resetButton={false} onChange={ updateSourceUrl }/>

					{ /* Tags */ }
					<h2>Tags</h2>
					<Tags
						search={false}
						multiline={true}
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
						<TabPanel forceRender={true}>
							<FileUpload
								name='File'
								limitTo={FileType.unknown}
								currentFile={file}
								updateFile={updateFile}
								currentUrl={fileUrl}
								updateUrl={updateFileUrl}
							/>
						</TabPanel>
						
						{ /* Thumbnail */ }
						<TabPanel forceRender={true}>
							<FileUpload
								name='Thumbnail'
								limitTo={FileType.image}
								currentFile={thumbnailFile}
								updateFile={updateThumbnail}
								currentUrl={thumbnailUrl}
								updateUrl={updateThumbnailUrl}
							/>
						</TabPanel>
						
						{ /* Project File */ }
						<TabPanel forceRender={true}>
							<FileUpload
								name='Project File'
								limitTo={FileType.project}
								currentFile={projectFile}
								updateFile={updateProjectFile}
								currentUrl={projectUrl}
								updateUrl={updateProjectUrl}
							/>
						</TabPanel>
					</Tabs>
				</div>
			</div>

			<div className="upload-menu pop-up">
				<button
					className={ `button focusable ${ uploading && 'disabled' }` } id="upload-post"
					onClick={ uploadPost } disabled={ uploading }
				>
					<img className="button-icon" src="/icons/nav/save.svg" title='Upload'/>
				</button>
				<button className="button focusable" id="cancel-post" onClick={() => window.location.href = "/"}>
					<img className="button-icon" src="/icons/nav/cancel.svg" title='Cancel'/>
				</button>
			</div>
		</div>
	)

	// Timestamp
	function updateTimestamp(value: Value) { if (value) setTimestamp(value.getTime()) }

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

	// Source URL
	function updateSourceUrl( url: string | null ) {
		setSourceUrl( url || "" )
		let host = getUrlDomain( url )
		switch ( host ) {
			case 'discord': setSourceType( SourceType.Discord ); break;
			case 'twitter':
			case 'x': setSourceType( SourceType.Twitter ); break;
			case 'bsky': setSourceType( SourceType.BlueSky ); break;
			case 'tumblr': setSourceType( SourceType.Tumblr ); break;
			case 'pixilart': setSourceType( SourceType.PixilArt ); break;
			default: setSourceType( SourceType.None ); break;
		}
	}

	function updateTags(tags: Tag[]) { setTags(tags) }

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

	// File Urls
	function updateFileUrl(url: string | null) {
		setFileUrl(url || "")
	}
	function updateThumbnailUrl(url: string | null) {
		setThumbnailUrl(url || "")
	}
	function updateProjectUrl(url: string | null) {
		setProjectUrl(url || "")
	}
}