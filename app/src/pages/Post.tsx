import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get } from "../util/api";

import MiniNav from "../components/layout/MiniNav";
import PostData from "../components/post/PostData";

import "../css/post.css";

export default function Post() {
    const { id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [post, setPost] = useState<any>();
    useEffect(() => {
        async function getData() {
            if (!id) return;
            let postId = parseInt(id);
            updatePost(postId);
            setLoaded(true);
        }
        getData();
    }, [id]);
    useEffect(() => {
        function loadImg() {
            if (!post || post.file.type !== 'image') return;
            let fileImg = document.getElementById("file-real") as HTMLImageElement;
            if (!fileImg) return;

            let preloader = new Image();
            preloader.src = post.file.url;
            preloader.onload = () => {
                fileImg.src = preloader.src;
            };
        };
        loadImg();
    }, [post]);

    async function updatePost(inId?: number) {
        let postId = inId || id;
        let gotten = await get(`getpost/${postId}`);
        console.log(gotten)
        setPost(gotten);
    }

    if (!loaded) return (<div>Loading...</div>);

    return (
        <div className="post">
            <div id="left">
                <MiniNav post={ post } updatePost={updatePost} />
                <div id="content">
                    { post && <PostData post={post}/> }
                </div>
            </div>
            <div id="right">
                <div className="post-file">
                    { post && post.file && post.file.type === 'image' &&
                        <img id="file-real" src={post.file.thumbnailUrl} alt={post.file.title} title={post.file.title} className="file-img"/> }
                    { post && post.file && post.file.type === 'video' &&
                        <video src={post.file.url} controls className="file-img"></video> }
                </div>
            </div>
        </div>
    )
}