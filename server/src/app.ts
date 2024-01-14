import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { getPost } from "./api/getPost";
import { search } from "./api/search";

import uploadPost from "./api/uploadPost";
import { editPost } from "./api/editPost";

const app = express();

// Plugins
app.use(cors());
app.use('/assets', express.static('assets'));
var jsonParser = bodyParser.json()

// Get info
app.get("/getpost/:id", (req, res) => getPost(req, res) );
app.post("/search", jsonParser, (req, res) => search(req, res) );

// Create/edit info
app.post("/upload", jsonParser, (req, res) => uploadPost(req, res) );
app.post("/editpost/:id", jsonParser, (req, res) => editPost(req, res) );
// app.post("/editpost/:id", ({ params, body, set }) => editPost(params, body, set) );

export default app;