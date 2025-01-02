import Elysia, { Context, t } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { cors } from "@elysiajs/cors"

import logger from "@argon/logger"

import { Database } from "bun:sqlite"
import { createTables, getSQLiteVersion } from "@argon/database/database"

import { log, Category, Status } from "@argon/util/debug"

import uploadPost from "@argon/endpoints/post/upload"
import getPost from "@argon/endpoints/post/get"
import search from "@argon/endpoints/search"
import deletePost from "@argon/endpoints/post/delete"
import getTagList from "@argon/endpoints/tag/list"
import editPost from "@argon/endpoints/post/edit"
import getRandomPost from "@argon/endpoints/post/random"
import { SortDirection } from "@argon/data/post"

// Database shit
export const database = new Database( "argon.db" )

let version = getSQLiteVersion()
log({
	category: Category.database, status: Status.loading,
	message: `SQLite version: ${ version }`
})

database.exec(`
	PRAGMA foreign_keys = ON;
	PRAGMA journal_mode = WAL;
`)
createTables()

const app = new Elysia()
	// Plugins
	.use( staticPlugin({ assets: "assets", prefix: "/assets" }) )
	.use( cors() )
	// .use( logger() )


	// Parse
	.onParse( ( { request }, contentType ) => {
		switch ( contentType ) {
			case "multipart/form-data": return request.formData()
		}
	})

	// Routes
	// Posts
	.post("/post/upload", async ( context: Context ) => await uploadPost( context ), {
		type: 'multipart/form-data',
		body: t.Partial( t.Object({
			fileUrl: t.String({
				format: "uri",
				error: "Invalid file URL"
			}),
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
	.post("/post/edit/:id", ( context: Context ) => editPost( context ), {
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
	.get("/post/:id", async ( context: Context ) => getPost( context ) )
	.post("/post/delete/:id", ( context: Context ) => deletePost( context ) )
	.get("/post/random", async ( context: Context ) => getRandomPost( context ) )

	// Search
	.post("/search", async ( context: Context ) => search(context, database), {
		type: 'json',
		body: t.Partial( t.Object({
			tags: t.Array( t.Partial( t.Object({
				name: t.String(),
				type: t.String(),
				exclude: t.Boolean()
			}) ) ),
			sort: t.Enum( SortDirection ),
			page: t.Partial ( t.Object({
				number: t.Numeric(),
				size: t.Numeric()
			}) )
		}) )
	} )

	// Tags
	.get("/tags/list", () => getTagList( ) )

	.listen( process.env.PORT || 3000 )

log({
	category: Category.server, status: Status.success,
	newLine: true,
	message: `Argon server running on ${app.server?.port}!`
})