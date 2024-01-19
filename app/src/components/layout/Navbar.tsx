import { useState } from "react";
import "../../css/navbar.css";
import Search from "./Search";
import UploadModal from "../modal/UploadModal";

export default function Navbar({ updatePosts }: { updatePosts: CallableFunction } ) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const toggleModal = () => {
        setIsOpen(!modalIsOpen);
    }
    const closeModal = () => setIsOpen(false);
    return (
        <div className="navbar">
            <div id="left">
                <div id="upload-button" className="nav-button" onClick={toggleModal}>
                    <img src="/icons/upload.svg" alt="upload" className="nav-icon"/>
                </div>
                <div id="argon">
                    <span id="title">Argon</span>
                    <span id="version">v0.1</span>
                </div>
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
                <div id="settings-button" className="nav-button">
                    <img src="/icons/settings.svg" alt="settings" className="nav-icon"/>
                </div>
            </div>
        </div>
    )
};