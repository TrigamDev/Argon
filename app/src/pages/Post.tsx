import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get } from "../util/api";

import MiniNav from "../components/layout/MiniNav";
import PostData from "../components/post/PostData";
import Visualizer from "../components/post/Visualizer";
import { isMobile } from "../util/user";

import "./Post.css";

export default function Post() {
    const { id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [post, setPost] = useState<any>();

    const mobile = isMobile();
    
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
        setPost(gotten);
    }

    function setTime(time: number) {
        let posted = { ...post };
        posted.file.time = time;
        setPost(posted);
    };

    if (!loaded) return (<div>Loading...</div>);

    return (
        <div className="post">
            { !mobile && 
                <div id="left">
                    <MiniNav post={ post } updatePost={updatePost} />
                    <div id="content">
                        { post && <PostData post={post}/> }
                    </div>
                </div>
            }
            { mobile && <MiniNav post={ post } updatePost={updatePost} /> }
            <div id="right">
                <div className="post-file">
                    { post && post.file && post.file.type === 'image' &&
                        <img id="file-real" src={post.file.thumbnailUrl} alt={post.file.title} title={post.file.title} className="file-img"/> }
                    { post && post.file && post.file.type === 'video' &&
                        <video src={post.file.url} controls className="file-img"></video> }
                    { post && post.file && post.file.type === 'audio' &&
                        <Visualizer post={post} bars={false} setTime={setTime} />
                    }
                </div>
            </div>
            { mobile &&
                <div id="left">
                    <div id="content">
                        { post && <PostData post={post}/> }
                    </div>
                </div>
            }
        </div>
    )
}