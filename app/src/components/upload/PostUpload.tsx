import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Value } from 'node_modules/react-datetime-picker/dist/cjs/shared/types'

import Text from '@argon/components/input/Text'
import Timestamp from '@argon/components/input/Timestamp'
import Tags from '@argon/components/input/Tags'

import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

import FileUpload from './FileUpload'

import { upload } from '@argon/util/api'

import { FileType, type Tag } from '@argon/util/types'
import { tagsToString, tagStringToTags } from '@argon/util/tag'

import '@argon/components/upload/post-upload.css'
import 'react-tabs/style/react-tabs.css'
import '@argon/globals.css'


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

	function uploadPost() {
		if (!file && (!fileUrl || fileUrl == "")) return alert("You must provide a file")

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

		upload(null, `post/upload`, formdata, () => {
			window.location.href = `.`
		})
	}

	return (
		<div className="post-upload-manual">
			<div className="upload-side" id="left">
				{ /* Title */ }
				<div className="upload-field" id="post-title">
					<span className="field-name">Title</span>
					<Text resetButton={false} onChange={setTitle}/>
				</div>

				{ /* Timestamp */ }
				<div className="upload-field" id="post-title">
					<span className="field-name">Created</span>
					<Timestamp resetButton={false} onChange={updateTimestamp}/>
				</div>

				{ /* Source URL */ }
				<div className="upload-field" id="post-source">
					<span className="field-name">Source URL</span>
					<Text resetButton={false} onChange={setSourceUrl}/>
				</div>

				{ /* Tags */ }
				<div className="upload-field" id="post-tags">
					<span className="field-name">Tags</span>
					<Tags search={false} multiline={true} onChange={updateTags}/>
				</div>
			</div>

			<div className="upload-side" id="right">
				<div className="upload-field" id="post-upload-file">
					<Tabs>
						<TabList>
							<Tab>File</Tab>
							<Tab>Thumbnail</Tab>
							<Tab>Project File</Tab>
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
								currentFile={projectFile}
								updateFile={updateProjectFile}
								currentUrl={projectUrl}
								updateUrl={updateProjectUrl}
							/>
						</TabPanel>
					</Tabs>
				</div>
			</div>

			<div className="upload-menu">
				<button className="post-button" id="upload-post" onClick={uploadPost}>
					<img className="post-icon" src="/icons/nav/save.svg" title='Upload'/>
				</button>
				<button className="post-button" id="cancel-post" onClick={() => window.location.href = "."}>
					<img className="post-icon" src="/icons/nav/cancel.svg" title='Cancel'/>
				</button>
			</div>
		</div>
	)

	function updateTimestamp(value: Value) { if (value) setTimestamp(value.getTime()) }

	function updateTags(tagString: string) { setTags(tagStringToTags(tagString)) }

	// Files
	function updateFile(file: File | null) {
		setFile(file)
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