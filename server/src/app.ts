import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'

import { getFile } from "./api/getFile";
import { getPost } from "./api/getPost";
import { search } from "./api/search";

import uploadPost from "./api/uploadPost";
import { editFile } from "./api/editFile";
import { editPost } from "./api/editPost";

const app = new Elysia();

// Plugins
app.use(cors());
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));

// Get info
app.get("/getfile/:id", ({ params }) => getFile(params) );
app.get("/getpost/:id", ({ params }) => getPost(params) );
app.post("/search", ({ request, body, set }) => search(request, body, set) );

// Create/edit info
app.post("/upload", ({ request, body, set }) => uploadPost(request, body, set) );
app.post("/editfile/:id", ({ params, body, set }) => editFile(params, body, set) );
app.post("/editpost/:id", ({ params, body, set }) => editPost(params, body, set) );

export default app;