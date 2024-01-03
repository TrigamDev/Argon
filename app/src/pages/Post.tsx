import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get } from "../util/api";
import MiniNav from "../components/layout/MiniNav";

import "../css/post.css";
import PostData from "../components/post/PostData";

export default function Post() {
    const { id } = useParams();
    const [post, setPost] = useState<any>();
    useEffect(() => {
        async function getData() {
            let post = await get(`getpost/${id}`);
            setPost(post);
        }
        getData();
    }, []);

    return (
        <div className="post">
            <div id="left">
                <MiniNav/>
                <div id="content">
                    { post && <PostData post={post}/> }
                </div>
            </div>
            <div id="right">
                <div className="post-file">
                    { post && post.file && post.file.type === 'image' &&
                        <img src={post.file.url} alt={post.file.title} title={post.file.title} className="file-img"/> }
                    { post && post.file && post.file.type === 'video' &&
                        <video src={post.file.url} controls className="file-img"></video> }
                </div>
            </div>
        </div>
    )
}