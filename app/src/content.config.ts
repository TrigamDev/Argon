import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const changelogs = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/changelogs' }),
	schema: z.object({
		version: z.string(),
		released: z.date(),
		tags: z.array(z.string())
	})
})

const misc = defineCollection({
	loader: glob({ pattern: '**/[^_]*.md', base: './src/content/misc' }),
})

export const collections = { changelogs, misc }