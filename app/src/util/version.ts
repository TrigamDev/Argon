import { getCollection, type CollectionEntry } from "astro:content"

const changelogs = await getCollection('changelogs')

export function getLatestVersion() {
	return getSortedVersions()[0]
}

export function getSortedVersions(): CollectionEntry<'changelogs'>[] {
	let sorted = changelogs.sort(
		(a: CollectionEntry<'changelogs'>, b: CollectionEntry<'changelogs'>) =>
			b.data.released.getTime() - a.data.released.getTime()
	)
	return sorted
}

export function isAlpha(): boolean {
	return import.meta.env.PROD == false
}