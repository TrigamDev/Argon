import { AtpAgent } from "@atproto/api"

export const agent = new AtpAgent({
	service: 'https://api.bsky.app'
})

export async function getBlueskyPost( url: string ) {
	const split = url.split( '/' )
	const postId = split[ split.length - 1 ]
	const author = split[ split.indexOf( 'profile' ) + 1 ]
	const uri = `at://${ author }/app.bsky.feed.post/${ postId }`

	const { data } = await agent.getPostThread({ uri: uri })
	return data
}