import Post from "@argon/data/post"

export function uploadPayload( post: Post ) {
	let embedImage = post.file.type === 'image' ? post.file.url : post.file.thumbnailUrl
	let tags = post.tags.map( tag => `${ tag.name }_(${ tag.type })`).join( ", " ).replace( /_/g, `\\_` )
	return {
		embeds: [{
			url: `https://argon.trigam.dev/post/${ post.id }`,
			title: `${ post.file.title }.${ post.file.extension } uploaded!`,
			description: `${ tags ?? 'No Tags' }`,
			image: { url: embedImage.replace( 'http:', 'https:' ) ?? "" },
			color: 0xA83FA3,
			timestamp: new Date( post.file.timestamp ?? 0 ).toISOString(),
			footer: { text: `ID: ${ post.id }` },
			fields: [
				{	name: 'Source',		value: post.file.sourceUrl ?? "None",		inline: true	},
				{	name: 'Type',		value: post.file.type ?? "Unknown",			inline: true	},
				{	name: 'Extension',	value: post.file.extension ?? "Unknown",	inline: true	}
			],
		}]
	}
}

export function errorPayload( error: Error ) {
	return {
		content: "<@480828680604614675>",
		embeds: [{
			title: `${ error.name ?? "Error!" }`,
			fields: [
				{	name: 'Message',	value: error.message ?? 'Unknown',		inline: false	},
				{	name: 'Cause',		value: error.cause ?? 'Unknown',		inline: false	}
			],
			description: `${ error.stack ?? '?' }`,
			color: 0xEF233C,
			footer: { text: `Oopsie daisies!` }
		}]
	}
}