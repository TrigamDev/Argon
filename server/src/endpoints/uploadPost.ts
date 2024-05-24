import { Context } from "elysia";
import { Database } from "bun:sqlite"

import type Tag from "../data/tag";

export default function uploadPost(context: Context, db: Database) {
	let input = parseInput(context.body as FormData)
	// Validate input
	if (!input.file && !input.fileUrl) {
		context.set.status = 400
		return { error: "No file provided" }
	}
	return input
}

/**
 * Parses the request body into a PostInput object
 * @param {FormData} input
 * @returns {PostInput}
 */
function parseInput(input: FormData): PostInput {
	// Parse tags
	let tags = input.get("tags") as string | Tag[]
	if (typeof tags === "string") tags = JSON.parse(tags) as Tag[]

	// Parse timestamp
	let timestamp = input.get("timestamp") as string | number
	if (typeof timestamp === "string") timestamp = parseInt(timestamp)
	
	// Return data
	return {
		fileUrl: input.get("fileUrl") as string,
		file: input.get("file") as Blob,
		timestamp: timestamp ?? 0,
		tags: tags,
		sourceUrl: input.get("sourceUrl") as string
	}
}

interface PostInput {
	fileUrl?: string
	file?: Blob
	timestamp?: string | number
	tags?: string | Tag[]
	sourceUrl?: string
}