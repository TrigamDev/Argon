import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'

import uploadPost from "./api/uploadPost";
import { getFile } from "./api/getFile";
import { getPost } from "./api/getPost";
import { editFile } from "./api/editFile";
import { editPost } from "./api/editPost";

const app = new Elysia();

// Plugins
app.use(cors());
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));

app.post("/upload", ({ request, body, set }) => uploadPost(request, body, set) );
app.get("/getfile/:id", ({ params }) => getFile(params) );
app.get("/getpost/:id", ({ params }) => getPost(params) );
app.post("/editfile/:id", ({ params, body, set }) => editFile(params, body, set) );
app.post("/editpost/:id", ({ params, body, set }) => editPost(params, body, set) );

export default app;