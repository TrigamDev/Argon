import Elysia, { Context, t } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { cors } from "@elysiajs/cors"

import logger from "./logger"

import { Database } from "bun:sqlite"
import { clearDatabase, createTables, getSQLiteVersion } from "./util/database"

import { log, Category, Status } from "./util/debug"

import uploadPost from "./endpoints/post/upload"
import getPost from "./endpoints/post/get"
import search from "./endpoints/search"
import deletePost from "./endpoints/post/delete"
import getTagList from "./endpoints/tag/list"
import editPost from "./endpoints/post/edit"
import { clearFiles } from "./util/files"

// Database shit
const db = new Database("argon.db")

let version = getSQLiteVersion(db)
log(Category.database, Status.loading, `SQLite version: ${version}`)

db.exec(`
	PRAGMA foreign_keys = ON;
	PRAGMA journal_mode = WAL;
`)
createTables(db)
clearDatabase(db)
await clearFiles()

const app = new Elysia()
	// Plugins
	.use(staticPlugin({ assets: "assets", prefix: "/assets" }))
	.use(cors())
	.use(logger())


	// Parse
	.onParse(({ request }, contentType) => {
		switch (contentType) {
			case "multipart/form-data": return request.formData()
		}
	})

	// Routes
	// Posts
	.post("/post/upload", async (context: Context) => await uploadPost(context, db), {
		type: 'multipart/form-data',
		body: t.Partial( t.Object({
			fileUrl: t.String({ format: "uri" }),
			file: t.File(),

			thumbnailUrl: t.String({ format: "uri" }),
			thumbnailFile: t.File(),

			projectUrl: t.String({ format: "uri" }),
			projectFile: t.File(),

			timestamp: t.Numeric(),
			tags: t.String(),

			sourceUrl: t.String(),

			title: t.String()
		}) )
	})
	.post("/post/edit/:id", (context: Context) => editPost(context, db), {
		type: 'multipart/form-data',
		body: t.Partial( t.Object({
			fileUrl: t.String({ format: "uri" }),
			file: t.File(),

			thumbnailUrl: t.String({ format: "uri" }),
			thumbnailFile: t.File(),

			projectUrl: t.String({ format: "uri" }),
			projectFile: t.File(),

			timestamp: t.Numeric(),
			tags: t.String(),

			sourceUrl: t.String(),

			title: t.String()
		}) )
	} )
	.get("/post/:id", async (context: Context) => getPost(context, db) )
	.post("/post/delete/:id", (context: Context) => deletePost(context, db) )

	// Search
	.post("/search", async (context: Context) => search(context, db), {
		type: 'json',
		body: t.Partial( t.Object({
			tags: t.Array( t.Partial( t.Object({
				name: t.String(),
				type: t.String(),
				exclude: t.Boolean()
			}) ) ),
			page: t.Partial ( t.Object({
				number: t.Numeric(),
				size: t.Numeric()
			}) )
		}) )
	} )

	// Tags
	.get("/tags/list", (context: Context) => getTagList(context, db) )

	.listen(process.env.PORT || 3000)

log(Category.server, Status.success, `Argon server running on ${app.server?.port}!`, true)