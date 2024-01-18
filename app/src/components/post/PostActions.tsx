export default function PostActions({ post }: { post: any }) {
    function downloadPostMedia() {
        downloadUrl(post?.file?.url as string, post?.file?.title as string);
    }

    return (
        <div id="post-actions">
            { post?.file?.url &&
                <a href={post?.file?.url} target="_blank" className="post-action" id="post-action-open" rel="noreferrer">
                    <img src="/icons/open_in_new_tab.svg" alt="Open in New Tab" title="Open in New Tab"/>
                </a>
            }
            { post?.file?.url &&
                <div className="post-action" id="post-action-copy" onClick={() => { copyPostMedia(post) }}>
                    <img src="/icons/copy.svg" alt="Copy" title="Copy"/>
                </div>
            }
            { post?.file?.url &&
                <div className="post-action" id="post-action-copy-url" onClick={() => { copyUrl(post?.file?.url as string) }}>
                    <img src="/icons/copy_link.svg" alt="Copy URL" title="Copy URL"/>
                </div>
            }
            { post?.file?.url &&
                <div className="post-action" id="post-action-download" onClick={downloadPostMedia}>
                    <img src="/icons/download.svg" alt="Download" title="Download"/>
                </div>
            }
            { post?.file?.layeredUrl &&
                <a href={post?.file.layeredUrl} target="_blank" className="post-action" id="post-action-download-layered">
                    <img src="/icons/layered.svg" alt="Download Layered" title="Download Layered"/>
                </a>
            }
        </div>
    )
}

async function copyPostMedia(post: any) {
    try {
        const img = new Image();
        img.src = post?.file?.url as string;
        let fetched = await fetch(post?.file?.url as string);
        let blob = await fetched.blob();
        let item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
    } catch (err) {
        alert("Your browser may not support copying images to the clipboard!")
    }
}

function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
};

async function downloadUrl (downUrl: string, fileName: string) {
    let image = await fetch(downUrl);
    let blob = await image.blob();
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove();
}