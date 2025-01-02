import Database from "bun:sqlite"

import { decodeTags, getTag } from "@argon/database/tag"
import { getFileById } from "@argon/database/file"

import Tag from "@argon/data/tag"
import Post, { SortDirection } from "@argon/data/post"

export interface SortOptions {
	tags: Tag[],
	sort: SortDirection,
	page: {
		size: number,
		number: number
	}
}
export function searchPostsByTag({ tags, sort, page }: SortOptions, db: Database): Post[] {
	// Get tag IDs
	const searchTagIds = tags
		.filter( tag => !tag.exclude )
		.map( tag => getTag({ name: tag.name, type: tag.type })?.id )
		.filter( Boolean )
	const excludeTagIds = tags
		.filter( tag => tag.exclude )
		.map( tag => getTag({ name: tag.name, type: tag.type })?.id )
		.filter( Boolean )

	// Construct query
	const baseQuery = `
		SELECT p.*, f.timestamp AS fileTimestamp
		FROM posts p
		INNER JOIN files f ON p.id = f.postId
	`

	let conditions: string[] = []
	let clauses: string[] = []
	let values: string[] = []

	// Tags
	searchTagIds.map( tagId => {
		conditions.push( `p.tags LIKE ?` )
		values.push( `%:${ tagId }:%` )
	})
	excludeTagIds.map( tagId => {
		conditions.push( `p.tags NOT LIKE ?` )
		values.push( `%:${ tagId }:%` )
	})

	// Sorting
	switch ( sort ) {
		// Post ID
		case SortDirection.postId:
			clauses.push( `ORDER by id DESC` )
			break
		case SortDirection.postIdReverse:
			clauses.push( `ORDER by id ASC` )
			break
		// Timestamp
		case SortDirection.timestamp:
			clauses.push( `ORDER by fileTimestamp DESC` )
			break
		case SortDirection.timestampReverse:
			clauses.push( `ORDER by fileTimestamp ASC` )
			break
	}

	// Pagination
	const pageOffset = ( page.number - 1 ) * page.size
	clauses.push( `LIMIT ${ page.size } OFFSET ${ pageOffset }` )

	// Construct final query
	let searchQuery = baseQuery
	if ( conditions.length > 0 ) searchQuery += ` WHERE ${ conditions.join( ` AND ` ) }`
	if ( clauses.length > 0 ) searchQuery += ` ${ clauses.join( ` ` ) }`

	const results = db.query( searchQuery ).all( values as any ) as any[]
	
	// Parse results
	return results.map( result => ({
		id: result?.id,
		timestamp: result?.timestamp,
		tags: decodeTags( result?.tags ),
		file: getFileById( result?.id )
	})) as Post[]
}