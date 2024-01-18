import { useState } from "react";

import "../../css/navbar.css";
import EditModal from '../modal/EditModal';

export default function MiniNav({ post, updatePost }: { post: any, updatePost: () => void }) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const toggleModal = () => {
        setIsOpen(!modalIsOpen);
    }
    const closeModal = () => setIsOpen(false);

    return (
        <div className="mininav">
            <a href="../../" id="home-button" className="nav-button">
                <img src="/icons/home.svg" alt="home" className="nav-icon"/>
            </a>
            <div id="bookmark-button" className="nav-button">
                <img src="/icons/bookmark.svg" alt="bookmark" className="nav-icon"/>
            </div>
            <div id="report-button" className="nav-button">
                <img src="/icons/report.svg" alt="report" className="nav-icon"/>
            </div>
            { post?.id &&
            <div id="edit-button" className="nav-button" onClick={toggleModal}>
                <img src="/icons/edit.svg" alt="edit" className="nav-icon"/>
            </div>
            }
            { post?.id &&
            <EditModal
                postToEdit={post}
                isOpen={modalIsOpen}
                closeModal={closeModal}
                updatePost={updatePost}
                key={modalIsOpen ? 'open' : 'closed'}
            /> }
        </div>
    )
}