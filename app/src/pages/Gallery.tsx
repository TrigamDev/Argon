import ImageGrid from "../components/gallery/ImageGrid"
import Navbar from "../components/layout/Navbar"

import "../css/gallery.css";

export default function Gallery() {
    return (
        <div>
            <Navbar/>
            <div id="content">
                <ImageGrid/>
            </div>
        </div>
    )
}