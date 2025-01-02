import Post from "@argon/data/post"

import { Category, log, Status } from "@argon/util/debug"
import { errorPayload, uploadPayload } from "@argon/notifs/payloads"

import config from "@argon/argonConfig"

export async function notifPostUpload(post: Post) {
	for (let webhookConfig of [config.publicWebhook, config.privateWebhook]) {
		if (webhookConfig.notifications.postUpload) {
			log({
				category: Category.webhook, status: Status.loading,
				message: `Sending upload notification for post #${post.id}...`
			})
			let payload = uploadPayload(post)
			webhookSend(webhookConfig.url, payload, () => {
				log({
					category: Category.webhook, status: Status.success,
					message: `Sent upload notification for post #${post.id}!`
				})
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
			log({
				category: Category.webhook, status: Status.loading,
				message: `Sending error notification...`
			})
			let payload = errorPayload(error)
			webhookSend(webhookConfig.url, payload, () => {
				log({
					category: Category.webhook, status: Status.success,
					message: `Sent error notification!`
				})
			})
		}
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
	else log({
		category: Category.webhook, status: Status.error,
		message: JSON.stringify(body, null, 4)
	})
}