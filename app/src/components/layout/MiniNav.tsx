import { useEffect, useState } from "react";
import EditModal from '../modal/EditModal';

import "./Navbar.css";

export default function MiniNav({ post, updatePost }: { post: any, updatePost: () => void }) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [bookmarked, setBookmarked] = useState(false);
    const toggleModal = () => {
        setIsOpen(!modalIsOpen);
    }
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        let bookmarks: any = localStorage.getItem('bookmarks');
        if (bookmarks) setBookmarks(JSON.parse(bookmarks) as any[]);
        else setBookmarks([]);
        if (bookmarks && bookmarks.includes(post?.id)) setBookmarked(true);
    }, [post]);

    function bookmarkPost() {
        let booked = bookmarks?.includes(post?.id);
        setBookmarked(!booked);
        let books = bookmarks;
        if (booked) books = bookmarks.filter((id: string) => id !== post?.id);
        else books?.push(post?.id);
        localStorage.setItem('bookmarks', JSON.stringify(books));
        setBookmarks(books);
    };

    return (
        <div className="mininav">
            <a href="../../" id="home-button" className="nav-button">
                <img src="/icons/home.svg" alt="home" className="nav-icon"/>
            </a>
            { !bookmarked &&
                <div id="bookmark-button" className="nav-button" onClick={bookmarkPost}>
                    <img src="/icons/bookmark.svg" alt="bookmark" className="nav-icon"/>
                </div>
            }
            { bookmarked &&
                <div id="bookmark-button" className="nav-button" onClick={bookmarkPost}>
                    <img src="/icons/unbookmark.svg" alt="bookmark" className="nav-icon"/>
                </div>
            }
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