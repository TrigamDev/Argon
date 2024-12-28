import { useEffect, useRef, useState, type ChangeEvent } from "react"

import { FileType } from "@argon/util/types"

import { extensionList, getFileType, getTypeFromMime } from "@argon/util/files"

import Text from "@argon/components/input/Text.tsx"

import "@argon/components/upload/file-upload.css"
import "@argon/globals.css"

export interface Props {
	name: string,

	limitTo?: FileType | null,
	
	currentFile: File | null | undefined,
	currentUrl: string | null | undefined,

	updateFile: (file: File | null) => void,
	updateUrl: (url: string | null) => void
}
export default function FileUpload({ name, limitTo = null, currentFile, currentUrl, updateFile, updateUrl }: Props) {
	// Input
	const inputRef = useRef<HTMLInputElement | null>(null)

	// Preview
	const [previewUrl, setPreviewUrl] = useState<string>()
	const [fileType, setFileType] = useState<FileType>(FileType.unknown)
	const [fileName, setFileName] = useState<string>("")

	const imagePreviewRef = useRef<HTMLImageElement | null>(null)
	const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
	const audioPreviewRef = useRef<HTMLAudioElement | null>(null)

	const [hasFile, setHasFile] = useState<boolean>(false)
	const [hasUrl, setHasUrl] = useState<boolean>(false)

	useEffect(() => {
		if ( currentFile ) getFileInfo( currentFile )
		setHasFile(currentFile != null)
		setHasUrl(currentUrl != null && currentUrl != "")
	}, [currentFile, currentUrl])

	// File Type Restriction
	useEffect(() => {
		if (limitTo && extensionList(limitTo))
			inputRef.current?.setAttribute('accept', extensionList(limitTo) || '')
	}, [limitTo])

	return (
		<div className="file-panel">
			<input type="file" ref={inputRef} onChange={handleFileUpdate} hidden/>

			{ /* File Upload */ }
			<div className={ `upload-field-sub ${ hasUrl ? 'disabled' : '' }` }>
				<button
					className="button text accent focusable"
					disabled={currentUrl != null && currentUrl != ""}
					onClick={() => { inputRef.current?.click() }}
				>
					Upload {name}
				</button>
			</div>

			<span className="field-name upload-separator">OR</span>

			{ /* File URL */ }
			<div className={ `upload-field-sub ${ hasFile ? 'disabled' : '' }` }>
				<h3>{name} URL</h3>
				<Text
					currentText={currentUrl || ""} resetButton={false}
					disabled={currentFile != null} onChange={handleUrlUpdate}
				/>
			</div>

			{ /* File Preview */ }
			<div className='file-preview'>
				{ !fileType || fileType == FileType.unknown && (hasFile || hasUrl) &&
					<div className='preview empty'>Selected: {fileName}</div>
				}
				{ fileType == FileType.image && <img className="preview" src={previewUrl} ref={ imagePreviewRef }/> }
				{ fileType == FileType.video && <video className="preview" src={previewUrl} ref={ videoPreviewRef } controls/> }
				{ fileType == FileType.audio && <audio className="preview" src={previewUrl} ref={ audioPreviewRef } controls/> }
			</div>

			<div className={ `upload-field-sub ${ hasFile || hasUrl ? '' : 'disabled' }` }>
				<button className="button text accent focusable" onClick={clearFile}>Clear {name}</button>
			</div>
		</div>
	)

	function handleFileUpdate(event: ChangeEvent<HTMLInputElement>) {
		let newFile = event.target.files?.item(0) || currentFile
		if (newFile) getFileInfo( newFile )
	}

	function getFileInfo( newFile: File ) {
		// Preview file
		let type = getTypeFromMime(newFile.type)
		setFileType(type)
		setFileName(newFile.name)

		loadFile(newFile, (url: string) => {
			setPreviewUrl(url)
		})

		// Callback
		updateFile(newFile)
	}

	function handleUrlUpdate(url: string) {
		let type = getFileType(url)
		setFileType(type)

		setPreviewUrl(url)
		// Callback
		updateUrl(url)
	}

	function clearFile() {
		updateFile(null)
		updateUrl("")
		setPreviewUrl("")
		setFileType(FileType.unknown)
		setFileName("")
	}

	// File Preview
	async function loadFile(file: File, callback: (url: string) => void) {
		let reader = new FileReader()
		reader.readAsArrayBuffer(file)
		reader.onload = async (event) => {
			// Get buffer
			let buffer = event.target?.result as ArrayBuffer
			if (!buffer) return

			// Convert to Blob
			let videoBlob = new Blob( [new Uint8Array(buffer)] , { type: 'video/mp4' } )
			let url = window.URL.createObjectURL(videoBlob)
			if (!url) return

			callback(url)
		}
	}
}