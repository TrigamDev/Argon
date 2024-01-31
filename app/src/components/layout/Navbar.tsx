import { useState } from "react";
import Search from "./Search";
import UploadModal from "../modal/UploadModal";
import { isMobile } from "../../util/user";

import "./Navbar.css";
import SettingsHamburger from "./SettingsHamburger";
import Hamburger from "./Hamburger";

export default function Navbar({ updatePosts, updateSettings, toggleBookmarks }: { updatePosts: CallableFunction, updateSettings: CallableFunction, toggleBookmarks: CallableFunction } ) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const toggleModal = () => { setIsOpen(!modalIsOpen); }
    const closeModal = () => setIsOpen(false);

    const mobile = isMobile();

    function search() {
        updatePosts();
        closeModal();
    }

    return (
        <div className="navbar">
            <div id="left">
                <Hamburger onSearch={search} toggleUploadModal={toggleModal}/>
                <a id="argon" href="">
                    <span id="title">Argon</span>
                    <span id="version">v0.4</span>
                </a>
                <UploadModal
                    isOpen={modalIsOpen}
                    closeModal={closeModal}
                    updatePosts={updatePosts}
                    key={modalIsOpen ? 'open' : 'closed'}
                />
            </div>
            <div id="right">
                { !mobile &&
                    <Search
                        onSearch={(query: string) => { updatePosts(query, true); }}
                        onChange={() => {}}
                        id="search"
                    />
                }
                <div id="bookmark-button" className="nav-button" onClick={() => { toggleBookmarks() }}>
                    <img src="/icons/bookmark.svg" alt="bookmark" className="nav-icon"/>
                </div>
                <SettingsHamburger updateSettings={updateSettings}/>
            </div>
        </div>
    )
};