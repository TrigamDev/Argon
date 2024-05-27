import Elysia, { Context, t } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { cors } from "@elysiajs/cors"

import { Database } from "bun:sqlite"
import { createTables, getSQLiteVersion } from "./util/database"

import { log, Category, Status } from "./util/debug"

import uploadPost from "./endpoints/post/upload"
import getPost from "./endpoints/post/get"
import search from "./endpoints/search"

// Database shit
const db = new Database("argon.db")

let version = getSQLiteVersion(db)
log(Category.database, Status.loading, `SQLite version: ${version}`)

db.exec(`
	PRAGMA foreign_keys = ON;
	PRAGMA journal_mode = WAL;
`)
createTables(db)

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
	.post("/post/upload", async (context: Context) => await uploadPost(context, db), {
		type: 'multipart/form-data',
		body: t.Partial( t.Object({
			fileUrl: t.String({ format: "uri" }),
			timestamp: t.Numeric(),
			tags: t.String(),
			sourceUrl: t.String(),
		}) )
	})
	.get("/post/:id", async (context: Context) => getPost(context, db) )
	.post("/search", async (context: Context) => search(context, db), {
		type: 'json',
		body: t.Partial( t.Object({
			tags: t.Array( t.Partial( t.Object({
				name: t.String(),
				type: t.String(),
				exclude: t.Boolean()
			}) ) ),
			page: t.Object({
				number: t.Numeric(),
				size: t.Numeric()
			})
		}) )
	} )

	.listen(process.env.PORT || 3000)

log(Category.server, Status.success, `Argon server running on ${app.server?.port}!`, true)