import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'

import { getPost } from "./api/getPost";
import { search } from "./api/search";

import uploadPost from "./api/uploadPost";
import { editPost } from "./api/editPost";

const app = new Elysia();

// Plugins
app.use(cors());
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));

// Get info
app.get("/getpost/:id", ({ params }) => getPost(params) );
app.post("/search", ({ request, body, set }) => search(request, body, set) );

// Create/edit info
app.post("/upload", ({ request, body, set }) => uploadPost(request, body, set) );
app.post("/editpost/:id", ({ params, body, set }) => editPost(params, body, set) );

export default app;