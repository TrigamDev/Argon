import Elysia, { Context, t } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { cors } from "@elysiajs/cors"

import { log, Category, Status } from "./util/debug"
import uploadPost from "./endpoints/post/upload"

const app = new Elysia()
	// Plugins
	.use(staticPlugin({ assets: "assets", prefix: "/assets" }))
	.use(cors())

	// Middleware

	// Parse
	.onParse(({ request }, contentType) => {
		switch (contentType) {
			case "multipart/form-data": return request.formData()
		}
	})

	// Routes
	.post("/post/upload", async (context: Context) => await uploadPost(context, /*db*/), {
		type: 'multipart/form-data',
		body: t.Partial( t.Object({
			fileUrl: t.String({ format: "uri" }),
			timestamp: t.Numeric(),
			tags: t.String(),
			sourceUrl: t.String(),
		}) )
	})

	.listen(process.env.PORT || 3000)

log(Category.server, Status.success, `Argon server running on ${app.server?.port}!`)