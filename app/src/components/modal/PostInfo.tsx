import { tagStringToTags, tagToTagString } from "../../util/tag";
import Search from "../layout/Search";

export default function PostInfo({ post, editMode, onUpdate }: { post?: any, editMode?: boolean, onUpdate: (data: any) => void }) {
    const fileTime = new Date(Number(post.file.timestamp)).toISOString().slice(0, 16);
    function updateTime(e: any) {
        onUpdate({
            ...post,
            file: {
                ...post.file,
                timestamp: new Date(e.target.value).getTime()
            }
        })
    }
    function updateTags(tagString: string) {
        onUpdate({
            ...post,
            tags: tagStringToTags(tagString)
        })
    }
    function updateSource(e: any) {
        onUpdate({
            ...post,
            file: {
                ...post.file,
                sourceUrl: e.target.value
            }
        })
    }
    
    return (
        <div id="edit-post-info">
            { editMode }
            <div id="timestamp-container" className="edit-modal-section">
                <label htmlFor="timestamp" className="edit-modal-title">Timestamp</label>
                <input id="timestamp" type="datetime-local" defaultValue={fileTime} onChange={updateTime} />
            </div>
            <div id="source-container" className="edit-modal-section">
                <label htmlFor="source" className="edit-modal-title">Source Url</label>
                <input id="source" type="text" defaultValue={post.file.sourceUrl} onChange={updateSource} />
            </div>
            <div id="tags-container" className="edit-modal-section">
                <label htmlFor="tags" className="edit-modal-title">Tags</label>
                <Search
                    onSearch={() => {}}
                    onChange={updateTags}
                    initValue={post.tags.map((tag: any) => {
                        return tagToTagString(tag);
                    }).join(' ')}
                    hideButton={true}
                    excludeExcluding={false}
                    big={true}
                    id="tags"
                />
            </div>
        </div>
    )
};