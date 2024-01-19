import Image from './Image';

import "./ImageGrid.css";

export default function ImageGrid({ posts }: { posts: any[] }) {
    return (
        <div id="image-grid">
            {posts.map((post: any) => (
                <Image key={post.id} post={post}/>
            ))}
        </div>
    );
}