import moment from "moment";

import { useEffect, useState } from "react";
import PostTags from "./PostTags";
import PostActions from "./PostActions";

export default function PostData({ post}: { post: any }) {
    if (!post) return (<div>Loading...</div>);
    
    const [size, setSize] = useState(0);
    const [res, setRes] = useState({ width: 0, height: 0 });
    const [duration, setDuration] = useState("");
    useEffect(() => {
        async function getData() {
            // Size
            const size = await getImageSize(post?.file?.url);
            setSize(size);
            // Resolution
            if (post?.file?.type === 'image') setRes(getImageRes(post?.file?.url));
            else if (post?.file?.type === 'video') getVideoRes(post?.file?.url, setRes);
        }
        getData();
    }, []);

    useEffect(() => {
        // Duration
        const durSecs = moment.duration(post?.file?.time ?? 0, "s");
        const durationLabel = [
            durSecs.minutes(),
            durSecs.seconds()
        ].map(v => v.toString().padStart(2, '0')).join(':');
        setDuration(durationLabel);
    }, [post?.file?.time]);
    
    // Size
    const fileSize = formatFileSize(size);
    return (
        <div id="post-data">
            { post?.file?.title && <span id="post-title">{post?.file?.title || ""}{'.' + (post?.file?.extension || "")}</span> }
            <div id="post-info">
                { post?.id &&
                    <span className="post-info-field" id="post-id">ID: {post?.id}</span>
                }
                { post?.file?.timestamp > 0 &&
                    <span className="post-info-field" id="post-file-timestamp">Created: {displayTimestamp(post?.file?.timestamp)}</span>
                }
                { post?.timestamp && <span className="post-info-field" id="post-timestamp">Posted: {displayTimestamp(Number(post?.timestamp))}</span> }
                { post?.file?.url && post?.file?.type !== "audio" && <span className="post-info-field" id="post-file-res">Resolution: {res?.width || 0}x{res?.height || 0}</span> }
                { post?.file?.url && post?.file?.type === "audio" && <span className="post-info-field" id="post-file-length">Duration: {duration || 0}</span> }
                { post?.file?.url && fileSize && <span className="post-info-field" id="post-file-size">Size: {fileSize || '0b'}</span> }
                { post?.file?.extension && <span className="post-info-field" id="post-file-type">File Type: {post?.file?.extension.toUpperCase() || ""}</span> }
                { post?.file?.sourceUrl && <span className="post-info-field" id="post-source">Source: <a href={post?.file?.sourceUrl} target="_blank">{new URL(post?.file?.sourceUrl).hostname}</a></span> }
            </div>
            <PostActions post={post}/>
            <PostTags post={post}/>
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