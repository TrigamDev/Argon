import Post from "../data/post";
import { Category, log, Status } from "./debug";
import config from "../../argonConfig"

export async function notifPostUpload(post: Post) {
	for (let webhookConfig of [config.publicWebhook, config.privateWebhook]) {
		if (webhookConfig.notifications.postUpload) {
			log(Category.webhook, Status.loading, `Sending upload notification for post #${post.id}...	`)
			let payload = uploadPayload(post)
			webhookSend(webhookConfig.url, payload, () => {
				log(Category.webhook, Status.success, `Sent upload notification for post #${post.id}!`)
			})
		}
	}
}

export async function notifPostDelete(post: Post) {

}

export async function notifPostEdit(post: Post) {

}

export async function notifError(error: Error) {
	for (let webhookConfig of [config.publicWebhook, config.privateWebhook]) {
		if (webhookConfig.notifications.error) {
			log(Category.webhook, Status.loading, `Sending error notification...`)
			let payload = errorPayload(error)
			webhookSend(webhookConfig.url, payload, () => {
				log(Category.webhook, Status.success, `Sent error notification!`)
			})
		}
	}
}

export function uploadPayload(post: Post) {
	let embedImage = post.file.type === 'image' ? post.file.url : post.file.thumbnailUrl
	let tags = post.tags.map(tag => `${tag.name}_(${tag.type})`).join(", ").replace(/_/g, `\\_`)
	return {
		embeds: [{
			url: `https://argon.trigam.dev/post/${post.id}`,
			title: `${post.file.title}.${post.file.extension} uploaded!`,
			description: `${tags ?? 'No Tags'}`,
			image: { url: embedImage.replace('http:', 'https:') ?? "" },
			color: 0xA83FA3,
			timestamp: new Date(post.file.timestamp ?? 0).toISOString(),
			footer: { text: `ID: ${post.id}` },
			fields: [
                {	name: 'Source',		value: post.file.sourceUrl ?? "None",		inline: true	},
                {	name: 'Type',		value: post.file.type ?? "Unknown",			inline: true	},
                {	name: 'Extension',	value: post.file.extension ?? "Unknown",	inline: true	}
            ],
		}]
	}
}

export function errorPayload(error: Error) {
	return {
		content: "<@480828680604614675>",
		embeds: [{
			title: `${error.name ?? "Error!"}`,
			fields: [
                {	name: 'Message',	value: error.message ?? 'Unknown',		inline: false	},
                {	name: 'Cause',		value: error.cause ?? 'Unknown',		inline: false	}
            ],
			description: `${error.stack ?? '?'}`,
			color: 0xEF233C,
			footer: { text: `Oopsie daisies!` }
		}]
	}
}

export async function webhookSend(url: string, payload: Object, callback: CallableFunction) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		body: JSON.stringify(payload),
	})
	const body = await response.json()
	if (response.ok) callback()
	else log(Category.webhook, Status.error, JSON.stringify(body, null, 4))
}