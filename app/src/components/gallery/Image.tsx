import { ImageSettings } from "./ImageGrid";
import "./ImageGrid.css";

export default function Image({ post, settings }: { post: any, settings: ImageSettings }) {

    const isNSFW = post.tags.some((tag: any) => !tag.safe)
        || post.tags.some((tag: any) => tag.name === 'nsfw' && tag.type === 'meta');
    const isSuggestive = post.tags.some((tag: any) => tag.name === 'suggestive' && tag.type === 'meta');
    const isUntagged = post.tags.some((tag: any) => tag.name === 'untagged' && tag.type === 'meta')
        || post.tags.length === 0;

    let compClass = `file ${post.file?.type}`;
    if (settings.blurNSFW && isNSFW) compClass += ' blur';
    if (settings.blurSuggestive && isSuggestive) compClass += ' blur';
    if (settings.blurUntagged && isUntagged) compClass += ' blur';
    
    return (
        <div>
            {
                post.file &&
                <a href={`./post/${post.id}`}>
                    <div className={compClass}>
                        { post?.file?.type !== 'audio' &&
                            <img src={post.file.thumbnailUrl} alt={post.file.title} title={post.file.title} className="file-img" />
                        }
                        { post?.file?.type === 'audio' &&
                            <img src={post.file.thumbnailUrl ?? '/default_music.png'} alt={post.file.title} title={post.file.title} className="file-img" />
                        }
                    </div>
                </a>
            }
        </div>
    )
}