import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Gallery from './pages/Gallery.tsx'
import Post from './pages/Post.tsx';

import "./css/global.css";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Gallery/> } />
                <Route path="/post/:id" element={ <Post/> } />
            </Routes>
        </BrowserRouter>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router/>
)
