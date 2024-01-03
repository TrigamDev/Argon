import "../../css/navbar.css";

export default function Navbar() {
    return (
        <div className="navbar">
            <div id="left">
                <div id="hamburger-button" className="nav-button">
                    <img src="/icons/hamburger.svg" alt="hamburger" className="nav-icon"/>
                </div>
            </div>
            <div id="right">
                <div id="search">
                    <input type="text" placeholder="Search" className="search-bar"/>
                    <div id="search-button" className="nav-button">
                        <img src="/icons/search.svg" alt="search" className="nav-icon"/>
                    </div>
                </div>
                <div id="upload-button" className="nav-button">
                    <img src="/icons/upload.svg" alt="upload" className="nav-icon"/>
                </div>
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