import "../../css/gallery.css";

export default function Image({ post }: { post: any }) {

    const isNSFW = post.tags.some((tag: any) => !tag.safe);
    const compClass = `file ${isNSFW ? 'nsfw' : ''} ${post.file?.type}`;
    return (
        <div>
            {
                post.file &&
                <a href={`./post/${post.id}`}>
                    <div className={compClass}>
                        <img src={post.file.thumbnailUrl} alt={post.file.title} title={post.file.title} className="file-img" />
                    </div>
                </a>
            }
        </div>
    )
}