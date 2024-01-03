import { useState, useEffect } from 'react'
import { post } from '../../util/api';
import Image from './Image';

import "../../css/gallery.css";

export default function ImageGrid() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        async function getPosts() {
            let searched = await post('search', {});
            let sorted = searched.sort((a: any, b: any) => {
                return b.file.timestamp - a.file.timestamp;
            });
            setPosts(sorted);
        };
        getPosts();
    }, []);

    return (
        <div id="image-grid">
            {posts.map((post: any) => (
                <Image key={post.id} post={post}/>
            ))}
        </div>
    );
}