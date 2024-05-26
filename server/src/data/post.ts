import File from "./file"
import type Tag from "./tag"

// const PostSchema = new Schema({
// 	id: { type: Number, required: true },
// 	timestamp: { type: Number, required: true },
// 	tags: { type: [Object], required: false },
// 	file: {
// 		url: { type: String, required: true },
// 		thumbnailUrl: { type: String, required: true },
// 		projectUrl: { type: String, required: false },
// 		sourceUrl: { type: String, required: false },
// 		timestamp: { type: Number, required: true },
// 		title: { type: String, required: true },
// 		type: { type: String, required: true },
// 		extension: { type: String, required: true }
// 	}
// })
// export const PostModel = model("Post", PostSchema)

export default interface Post {
	id: number
	timestamp: number
	tags: Tag[]
	file: File
}