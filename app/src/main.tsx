import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Gallery from './pages/Gallery.tsx'
import Post from './pages/Post.tsx';

import "./global.css";
import TagList from './pages/TagList.tsx';

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Gallery/> } />
                <Route path="/post/:id" element={ <Post/> } />
                <Route path="/tags" element={ <TagList/> } />
            </Routes>
        </BrowserRouter>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router/>
)
