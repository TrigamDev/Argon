import { useState } from "react";
import "../../css/navbar.css";
import Search from "./Search";
import UploadModal from "../modal/UploadModal";
import Hamburger from "./Hamburger";

export default function Navbar({ updatePosts, updateSettings }: { updatePosts: CallableFunction, updateSettings: CallableFunction } ) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const toggleModal = () => { setIsOpen(!modalIsOpen); }
    const closeModal = () => setIsOpen(false);

    return (
        <div className="navbar">
            <div id="left">
                <div id="upload-button" className="nav-button" onClick={toggleModal}>
                    <img src="/icons/upload.svg" alt="upload" className="nav-icon"/>
                </div>
                <a id="argon" href="">
                    <span id="title">Argon</span>
                    <span id="version">v0.2</span>
                </a>
                <UploadModal
                    isOpen={modalIsOpen}
                    closeModal={closeModal}
                    updatePosts={updatePosts}
                    key={modalIsOpen ? 'open' : 'closed'}
                />
            </div>
            <div id="right">
                <Search
                    onSearch={(query: string) => { updatePosts(query, true); }}
                    onChange={() => {}}
                    id="search"
                />
                <div id="bookmark-button" className="nav-button">
                    <img src="/icons/bookmark.svg" alt="bookmark" className="nav-icon"/>
                </div>
                <Hamburger updateSettings={updateSettings}/>
            </div>
        </div>
    )
};