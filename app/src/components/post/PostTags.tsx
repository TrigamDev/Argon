import { getTagIcon } from "../../util/tag";

export default function PostTags({ post }: { post: any }) {
    return (
        <div id="post-tags">
            { post?.tags?.map((tag: any) => {
                return <PostTag tag={tag} key={`${tag.name}_(${tag.type})`}/>
            }) }
        </div>
    )
};

export function PostTag({ tag }: { tag: any }) {
    let icon = getTagIcon(tag);
    return (
        <div className="post-tag">
            { icon && <img src={icon} alt={tag.type} title={tag.type}/> }
            <span className="post-tag-name">{tag.name}</span>
        </div>
    )
};