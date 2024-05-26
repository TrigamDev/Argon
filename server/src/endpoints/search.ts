import Database from "bun:sqlite"
import { Context } from "elysia"
import { Sorts, searchPostsByTag } from "../util/database"

export default function search(context: Context, db: Database) {
	// let query = (context.query as any).q
	// if (!query) {
	// 	context.set.status = 400
	// 	return { error: "No query provided" }
	// }
	let posts = searchPostsByTag([
		{ name: 'trigam', type: 'artist', exclude: false}
	], Sorts.timestamp, db)
	//let posts = searchPosts(query, db)
	return posts
}