import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";

import { getPost } from "./api/getPost";
import { search } from "./api/search";
import { getTags } from "./api/getTags";
import { postList } from "./api/postList";

import uploadPost from "./api/uploadPost";
import editPost from "./api/editPost";
import deletePost from "./api/deletePost";
import { baseDir } from "./util/dir";

const app = express();
const logger = (req: any, res: any, next: any) => {
    console.log(`📥  ${req.method} ${req.url}`);
    next();
};

// Plugins
//app.use(logger);
app.use(cors());
app.use('/files', express.static(baseDir + '/assets'))

// Middleware
var jsonParser = bodyParser.json()
const upload = multer({
    limits: {
        fileSize: 1 * 1024 * 1024 * 1024 // 1GB
    }
});
const fileSizeError = (err: any, req: any, res: any, next: any) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        console.error(`💾  ❌ File too large`);
        res.status(400).json({ error: "File too large" });
    } else next();
}

// Get info
app.get("/api/getpost/:id", (req, res) => getPost(req, res) );
app.post("/api/search", jsonParser, (req, res) => search(req, res) );
app.get("/api/gettags", (req, res) => getTags(req, res));
app.post("/api/postlist", jsonParser, (req, res) => postList(req, res));

// Create/edit info
app.post("/api/upload", upload.any(), fileSizeError, (req: any, res: any) => uploadPost(req, res) );
app.post("/api/editpost/:id", jsonParser, (req, res) => editPost(req, res) );
app.post("/api/deletepost/:id", jsonParser, (req, res) => deletePost(req, res) );

export default app;