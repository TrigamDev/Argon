import { useState } from 'react';
import Modal from 'react-modal';
import { post } from '../../util/api';

import PostInfo from './PostInfo';
import "../../css/modal.css";

export default function EditModal({ postToEdit, isOpen, closeModal, updatePost }: { postToEdit: any, isOpen: boolean, closeModal: () => void , updatePost: () => void}) {
    Modal.setAppElement('#root');
    const [modalIsOpen] = useState(isOpen);

    const [postTimestamp, setPostTimestamp] = useState(postToEdit?.file?.timestamp);
    const [postTags, setPostTags] = useState(postToEdit?.tags);
    const [postSourceUrl, setPostSourceUrl] = useState(postToEdit?.file?.sourceUrl);

    function updatePostData(data: any) {
        if (data.file.timestamp) setPostTimestamp(data.file.timestamp);
        if (data.file.sourceUrl) setPostSourceUrl(data.file.sourceUrl);
        if (data.tags) setPostTags(data.tags);
    };

    async function savePost() {
        await post(`editpost/${postToEdit?.id}`, {
            timestamp: postTimestamp,
            tags: postTags,
            sourceUrl: postSourceUrl
        });
        closeModal();
        updatePost();
    };

    async function deletePost(e: any) {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this post?")) {
            await post(`deletepost/${postToEdit?.id}`, {});
            closeModal();
            window.location.href = '/';
        }
    }

    return (
        <div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Modal"
                overlayClassName="modal-overlay"
                className="modal"
                id="edit-modal"
            >
                <div id="left" className='side'>
                    <span id="title">Edit {postToEdit?.file?.title}.{postToEdit?.file?.extension}</span>
                    <div id="inputs">
                        { postToEdit &&
                            <PostInfo
                                post={postToEdit}
                                editMode={true}
                                onUpdate={updatePostData}
                            />
                        }
                    </div>
                </div>
                <div id="right" className='side'>
                    <div id="file-preview">
                        { postToEdit && postToEdit.file && postToEdit.file.type === 'image' &&
                            <img src={postToEdit.file.url} alt={postToEdit.file.title} title={postToEdit.file.title} className="file"/> }
                        { postToEdit && postToEdit.file && postToEdit.file.type === 'video' &&
                            <video src={postToEdit.file.url} controls className="file"></video> }
                        <div id="file-info">
                            <ul>
                                <li><b>File Name</b>: {postToEdit?.file?.title}.{postToEdit?.file?.extension}</li>
                                <li><b>Post ID</b>: {postToEdit?.id}</li>
                            </ul>
                        </div>
                    </div>
                    <div id="buttons">
                        <img id="delete" className="modal-button" src="/icons/delete.svg" title="Delete Post" onClick={deletePost}/>
                        <img id="close" className="modal-button" src="/icons/upload.svg" title="Cancel" onClick={closeModal}/>
                        <img id="save" className="modal-button" src="/icons/save.svg" title="Save Changes" onClick={savePost}/>
                    </div>
                </div>
            </Modal>
        </div>
    );
}