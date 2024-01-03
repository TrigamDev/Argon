import moment from "moment";

import "../../css/post.css";
import { useEffect, useState } from "react";

export default function PostData({ post}: { post: any }) {
    const [size, setSize] = useState(0);
    const [res, setRes] = useState({ width: 0, height: 0 });
    useEffect(() => {
        async function getData() {
            const size = await getImageSize(post?.file.url);
            setSize(size);
        }
        getData();
    }, []);
    // Resolution
    if (post?.file.type === 'image') setRes(getImageRes(post?.file.url));
    else if (post?.file.type === 'video') getVideoRes(post?.file.url, setRes);
    // Size
    const fileSize = formatFileSize(size);
    return (
        <div id="post-data">
            <span id="post-title">{post?.file.title || ""}{'.' + post?.file.extension || ""}</span>
            <div id="post-info">
                <span className="post-info-field" id="post-id">ID: {post?.id || 0}</span>
                <span className="post-info-field" id="post-file-timestamp">Created: {displayTimestamp(post?.file.timestamp || 0)}</span>
                <span className="post-info-field" id="post-timestamp">Posted: {displayTimestamp(post?.timestamp || 0)}</span>
                <span className="post-info-field" id="post-file-res">Resolution: {res?.width || 0}x{res?.height || 0}</span>
                <span className="post-info-field" id="post-file-size">Size: {fileSize}</span>
                <span className="post-info-field" id="post-file-type">File Type: {post?.file.extension.toUpperCase() || ""}</span>
            </div>
        </div>
    )
};

function displayTimestamp(timestamp: number) {
    return moment(timestamp).format("M/D/YYYY h:mm:ss A");
}

function getImageRes(url: string) {
    let img = new Image();
    img.src = url;
    return { width: img.width, height: img.height };
};

function getVideoRes(url: string, setRes: any) {
    let video = document.createElement('video');
    video.src = url;
    video.addEventListener('loadedmetadata', () => {
        setRes( { width: video.videoWidth, height: video.videoHeight } );
    });
};

async function getImageSize(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return blob.size;
};

function formatFileSize(fileSize: number) {
    if (!fileSize) return "0 B";
    if (fileSize < 1000) return `${fileSize} B`;
    else if (fileSize < 1000000) return `${roundToTwo(fileSize / 1000)} KB`;
    else if (fileSize < 1000000000) return `${roundToTwo(fileSize / 1000000)} MB`;
    else return `${roundToTwo(fileSize / 1000000000)} GB`;
};

function roundToTwo(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100
};