import { useState } from "react";

import "../../css/navbar.css";

export default function MiniNav() {
    const [editMode] = useState<boolean>(false);

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
            {
                editMode ?
                <div id="edit-button" className="nav-button">
                    <img src="/icons/save.svg" alt="edit" className="nav-icon"/>
                </div>
                :
                <div id="save-button" className="nav-button">
                    <img src="/icons/edit.svg" alt="save" className="nav-icon"/>
                </div>
            }
        </div>
    )
}