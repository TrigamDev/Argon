import Image from './Image';

import "./ImageGrid.css";

export interface ImageSettings {
    blurNSFW: boolean;
    blurSuggestive: boolean;
    blurUntagged: boolean;
}

export default function ImageGrid({ posts, settings }: { posts: any[], settings: ImageSettings }) {
    return (
        <div id="image-grid">
            {posts.map((post: any) => (
                <Image key={post.id} post={post} settings={settings}/>
            ))}
        </div>
    );
}