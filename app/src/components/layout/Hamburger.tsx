import { useEffect, useState } from "react";
import { isMobile } from "../../util/user";

import "./Hamburger.css";
import Search from "./Search";
import { post } from "../../util/api";

export default function Hamburger({ onSearch, toggleUploadModal }: { onSearch: CallableFunction, toggleUploadModal: CallableFunction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [posts, setPosts] = useState<any>([]);
    const mobile = isMobile();

    useEffect(() => {
        async function getPosts() {
            let posts = await post('search', { pageSize: -1 });
            setPosts(posts);
        }
        getPosts();
    }, []);

    window.onclick = function(e: any) { if (e.target.id !== 'hamburger-button') setIsOpen(false); }
    function toggleOpen(e?: any) {
        e?.stopPropagation();
        setIsOpen(!isOpen);
    }

    function openModal() {
        toggleUploadModal();
        setIsOpen(false);
    }

    function openRandomPost() {
        let random = posts.posts[Math.floor(Math.random() * posts.posts.length)];
        window.location.href = `/post/${random.id}`;
    }

    return (
        <div id="hamburger">
            <div id="hamburger-button" className="nav-button" onClick={toggleOpen}>
                <img src="/icons/hamburger.svg" alt="hamburger" className="nav-icon"/>
            </div>
            <div id="hamburger-menu" className={ 'hamburger-menu ham-left ' + (isOpen ? 'open' : 'closed') } onClick={(e: any) => { e.stopPropagation() }}>
                { mobile && <SearchOption onSearch={onSearch}/> }
                <ModalOption label="Upload" onClick={openModal}/>
                <LinkOption label="Tags List" url="/tags"/>
                <div className="hamburger-item" onClick={openRandomPost}>
                    <span className="label">Random Post</span>
                </div>
            </div>
        </div>
    )
}

function LinkOption({ label, url }: { label: string, url: string }) {
    return (
        <a className="hamburger-item" href={url}>
            <span className="label">{label}</span>
        </a>
    )
};

function SearchOption({ onSearch }: { onSearch: CallableFunction }) {
    return (
        <div className="hamburger-item">
            <Search
                onSearch={(query: string) => { onSearch(query, true); }}
                onChange={() => {}}
                id="search"
                buttonFirst={true}
            />
        </div>
    )
}

function ModalOption({ label, onClick }: { label: string, onClick: CallableFunction }) {
    return (
        <div className="hamburger-item" onClick={() => { onClick(); }}>
            <div id="upload-button" className="ham-button">
                <img src="/icons/upload.svg" alt="upload" className="ham-icon"/>
            </div>
            <span className="label">{label}</span>
        </div>
    )
}