import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'

import uploadPost from "./api/uploadPost";

const app = new Elysia();

// Plugins
app.use(cors());
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));

app.post("/upload", ({ request, body, set }) => uploadPost(request, body, set));

export default app;