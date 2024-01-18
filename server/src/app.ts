import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";

import { getPost } from "./api/getPost";
import { search } from "./api/search";
import { getTags } from "./api/getTags";

import uploadPost from "./api/uploadPost";
import editPost from "./api/editPost";
import deletePost from "./api/deletePost";

const app = express();
const logger = (req: any, res: any, next: any) => {
    console.log(`📥  ${req.method} ${req.url}`);
    next();
};

// Plugins
//app.use(logger);
app.use(cors());
app.use('/assets', express.static('assets'));

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
app.get("/getpost/:id", (req, res) => getPost(req, res) );
app.post("/search", jsonParser, (req, res) => search(req, res) );
app.get("/gettags", (req, res) => getTags(req, res));

// Create/edit info
app.post("/upload", upload.any(), fileSizeError, (req: any, res: any) => uploadPost(req, res) );
app.post("/editpost/:id", jsonParser, (req, res) => editPost(req, res) );
app.post("/deletepost/:id", jsonParser, (req, res) => deletePost(req, res) );

export default app;