import { defineCollection, z } from "astro:content"

const changelogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		version: z.string(),
		released: z.number(),
		tags: z.array(z.string())
	})
})

export const collections = {
	'changelogs': changelogCollection
}