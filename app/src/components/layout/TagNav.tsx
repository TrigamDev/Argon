import { useEffect, useState } from "react";

import "./TagNav.css";

export default function TagNav({ tags }: { tags: any[] }) {
    const [tagCount, setTagCount] = useState(0);
    useEffect(() => {
        // tags is an object with keys as tag types and values as arrays of tags
        let count = 0;
        Object.keys(tags).forEach((type: any) => {
            count += tags[type].length;
        });
        setTagCount(count);
    }, [tags]);
    return (
        <div className="navbar">
            <div id="left">
                <a href="../" id="home-button" className="nav-button">
                    <img src="/icons/home.svg" alt="home" className="nav-icon"/>
                </a>
            </div>
            <div id="right">
                <span id="tag-count">Tags: {tagCount}</span>
            </div>
        </div>
    )
}