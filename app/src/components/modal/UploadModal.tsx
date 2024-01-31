import { useState } from 'react';
import Modal from 'react-modal';
import { upload } from '../../util/api';

import "./Modal.css";

export default function UploadModal({ isOpen, closeModal, updatePosts }: { isOpen: boolean, closeModal: () => void, updatePosts: CallableFunction }) {
    Modal.setAppElement('#root');
    const [modalIsOpen] = useState(isOpen);

    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>();
    const [coverUrl, setCoverUrl] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>();
    const [layeredUrl, setLayeredUrl] = useState('');
    const [layeredFile, setLayeredFile] = useState<File | null>();
    const [sourceUrl, setSourceUrl] = useState('');
    const [title, setTitle] = useState('');
    const [timestamp, setTimestamp] = useState(0);

    const [fileType, setFileType] = useState('');
    const [lastModified, setLastModified] = useState(0);
    const [isDiscordSource, setIsDiscordSource] = useState(false);

    async function uploadPost() {
        if (!file && !url) return alert("Missing file or url!");
        
        let postData = new FormData();
        if (url) postData.append('url', url);
        if (file) postData.append('file', file);
        if (coverUrl) postData.append('musicCoverUrl', coverUrl);
        if (coverFile) postData.append('musicCoverFile', coverFile);
        if (layeredUrl) postData.append('layeredUrl', layeredUrl);
        if (layeredFile) postData.append('layeredFile', layeredFile);
        postData.append('sourceUrl', sourceUrl);
        postData.append('title', title);
        postData.append('timestamp', timestamp.toString());
        
        await upload(`upload`, postData);
        closeModal();
        updatePosts();
    }

    function handlePaste(e: any) {
        if (!modalIsOpen) return;
        const items = e?.clipboardData?.items;
        let file;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === 0) { file = items[i].getAsFile(); break; }
        };
        if (!file) return;
        updateFile(null, file);
    };

    return (
        <div onPaste={handlePaste}>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}
            contentLabel="Edit Modal" overlayClassName="modal-overlay" className="modal" id="upload-modal">
                <div id="left" className='side'>
                    <span id="title">Upload Post</span>
                    <div id="post-input-data">
                        {/* Title */}
                        <div id="post-title" className='post-data-elem'>
                            <span className="label">Title</span>
                            <input type="text" id="title-input" className="modal-text-input" placeholder="Post Title" onChange={e => setTitle(e.target.value)}/>
                        </div>
                        {/* Timestamp */}
                        <div id="post-timestamp" className='post-data-elem'>
                            <span className="label">Timestamp</span>
                            <input type="datetime-local" id="timestamp-input" className="modal-text-input" placeholder="Timestamp" onChange={updateTimestamp}/>
                            <div id="timestamp-buttons" className='button-bros'>
                                { lastModified > 0 && <input type="button" id="last-modified-time" className='small-button' value="Get From File" onClick={() => updateTimestamp(null, lastModified)}/> }
                                { isDiscordSource && <input type="button" id="discord-time" className='small-button' value="Get From Discord Id" onClick={() => updateTimestamp(null, getTimestampFromDiscordSource())}/> }
                            </div>
                        </div>
                        {/* SourceUrl */}
                        <div id="post-source" className='post-data-elem'>
                            <span className="label">Source URL</span>
                            <input type="text" id="source-input" className="modal-text-input" placeholder="Source URL" onChange={updateSourceUrl}/>
                        </div>
                        { /* Project File */ }
                        <div id="layered-file" className='file-upload-section post-data-elem'>
                            <span id="layered-file-label" className='label'>Project File</span>
                            <div id="layered-file-url-container" className={'post-data-elem ' + (layeredFile ? 'hidden' : '')}>
                                <input type="text" id="layered-file-url" className="modal-text-input" placeholder="Project File URL" onChange={updateLayeredFileUrl}/>
                            </div>
                            <div id="layered-upload-preview" className={(layeredUrl ? 'hidden ' : '') + (layeredFile ? 'selected' : 'empty')}>
                                { layeredFile && <span id="layered-file-name">Selected: {layeredFile.name}</span> }
                            </div>
                            <div id="layered-file-controls" className={'button-bros ' + (layeredUrl ? 'hidden' : '')}>
                                <input type="file" id="upload-layered-file-bad" onChange={updateLayeredFile} style={{ display: "none" }}></input>
                                <input type="button" id="upload-layered-file" className="file-button" value="Upload Project File"
                                    onClick={() => document.getElementById('upload-layered-file-bad')?.click()}/>
                                <input type="button" id="clear-layered-file" className="file-button" value="Clear Project File" onClick={() => setLayeredFile(null)}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="right" className='side'>
                    { /* Main File */ }
                    <div id="main-file" className='file-upload-section'>
                        <span id="main-file-label" className='label'>File</span>
                        <div id="file-url-container" className={(file ? 'hidden' : '')}>
                            <input type="text" id="file-url" className="modal-text-input" placeholder="File URL" onChange={updateFileUrl}/>
                        </div>
                        { fileType !== 'audio' &&
                            <div id="upload-preview" className={'img-preview ' + (url ? 'hidden ' : '') + (file ? 'selected' : 'empty')}>
                                { file && fileType === 'image' && <img id="preview" className='file preview-file'/> }
                                { file && fileType === 'video' && <video id="preview" className='file preview-file' controls/> }
                            </div>
                        }
                        { fileType === 'audio' &&
                            <div id="upload-preview" className={'img-preview audio ' + (url ? 'hidden ' : '') + (file ? 'selected' : 'empty')}>
                                { file && <audio id="preview" className='file preview-file audio-preview' controls/> }
                            </div>
                        }
                        <div id="file-controls" className={'button-bros ' + (url ? 'hidden' : '')}>
                            <input type="file" id="upload-file-bad" onChange={updateFile} style={{ display: "none" }}></input>
                            <input type="button" id="upload-file" className="file-button" value="Upload File"
                                onClick={() => document.getElementById('upload-file-bad')?.click()}/>
                            <input type="button" id="clear-file" className="file-button" value="Clear File" onClick={clearFile}/>
                        </div>
                    </div>
                    { /* Cover File */ }
                    { fileType === 'audio' &&
                    <div id="cover-file" className='file-upload-section cover-upload'>
                        <span id="cover-file-label" className='label'>Cover Image</span>
                        <div id="cover-file-url-container" className={(coverFile ? 'hidden' : '')}>
                            <input type="text" id="cover-file-url" className="modal-text-input" placeholder="Cover Image URL" onChange={updateCoverUrl}/>
                        </div>
                        <div id="cover-upload-preview" className={'img-preview ' + (coverUrl ? 'hidden ' : '') + (coverFile ? 'selected' : 'empty')}>
                            { coverFile && <img id="cover-preview" className='file preview-file'/> }
                        </div>
                        <div id="cover-file-controls" className={'button-bros ' + (coverUrl ? 'hidden' : '')}>
                            <input type="file" id="cover-upload-file-bad" onChange={updateCoverFile} style={{ display: "none" }}></input>
                            <input type="button" id="cover-upload-file" className="file-button" value="Upload Cover"
                                onClick={() => document.getElementById('cover-upload-file-bad')?.click()}/>
                            <input type="button" id="cover-clear-file" className="file-button" value="Clear Cover" onClick={() => setCoverFile(null)}/>
                        </div>
                    </div>
                    }
                    { /* Buttons */ }
                    <div id="buttons">
                        <img id="close" className="modal-button" src="/icons/upload.svg" title="Cancel" onClick={closeModal}/>
                        <img id="save" className="modal-button" src="/icons/save.svg" title="Save Changes" onClick={uploadPost}/>
                    </div>
                </div>
            </Modal>
        </div>
    );

    function updateFile(e: any, file?: any) {
        let selectedFile = e?.target?.files[0] || file;
        setFile(selectedFile);
        setFileType(getFileType(selectedFile.name));
        setLastModified(selectedFile.lastModified);

        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview')?.setAttribute('src', e.target?.result as string);
        }
        reader.readAsDataURL(selectedFile);
    };

    async function updateFileUrl(e: any) {
        setUrl(e.target.value);
        setFileType(getFileType(e.target.value));
    };

    function updateLayeredFile(e: any) {
        setLayeredFile(e.target.files[0]);
    };

    async function updateLayeredFileUrl(e: any) {
        setLayeredUrl(e.target.value);
    };

    function updateCoverFile(e: any, coverFile?: any) {
        let selectedFile = e?.target?.files[0] || coverFile;
        setCoverFile(selectedFile);

        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cover-preview')?.setAttribute('src', e.target?.result as string);
        }
        reader.readAsDataURL(selectedFile);
    };

    async function updateCoverUrl(e: any) {
        setCoverUrl(e.target.value);
    };

    function updateTimestamp(e: any, timestamp?: number) {
        if (!e && timestamp) {
            setTimestamp(new Date(timestamp).getTime());
            document.getElementById('timestamp-input')?.setAttribute('value', new Date(timestamp).toISOString().slice(0, 16));
        };
        if (e && e.target) {
            setTimestamp(new Date(e.target.value).getTime());
        };
        if (!e && !timestamp) console.log('dunce')
    };

    function updateSourceUrl(e: any) {
        setSourceUrl(e.target.value);
        // check if source url is from discord
        if (e.target.value.includes('discord')) setIsDiscordSource(true);
        else setIsDiscordSource(false);
    }

    function getTimestampFromDiscordSource() {
        let url = sourceUrl;
        let id = url.split('/').pop()?.split('?')[0];
        let binarySnowflake = parseInt(id || '0', 10).toString(2);
        if (binarySnowflake.length < 64) {
            let diff = 64 - binarySnowflake.length;
            for (let i = 0; i < diff; i++) {
                binarySnowflake = '0' + binarySnowflake;
            }
        }
        let timestamp = parseInt(binarySnowflake.substring(0, 42), 2) + 1420070400000;
        return timestamp;
    }

    function clearFile() {
        setFile(null);
        setFileType('');
        setLastModified(0);
    }
}

const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg" ];
const videoTypes = [ "mp4", "webm", "mov", "avi" ];
const audioTypes = [ "mp3", "wav", "ogg", "flac" ];

export function getFileExtension(url: string): string {
    return url.split(".").pop()?.split('?')[0] || "";
};

export function getFileType(url: string): "image" | "video" | "audio" | "unknown" {
    let extension = getFileExtension(url);
    if (imageTypes.includes(extension)) return "image";
    if (videoTypes.includes(extension)) return "video";
    if (audioTypes.includes(extension)) return "audio";
    return "unknown";
}