import type Post from "../data/post"
// import { PostModel } from "../data/post"
import { Category, Status, log } from "./debug"

export async function insertPost(post: Post) {
	log(Category.database, Status.loading, `Saving post #${post.id}...`)
	// let postModel = new PostModel(post)
	// await postModel.save()
	log(Category.database, Status.success, `Saved post #${post.id}!`)
}