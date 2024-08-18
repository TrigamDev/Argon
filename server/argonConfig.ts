export interface ArgonConfig {
	publicWebhook: WebhookConfig;
	privateWebhook: WebhookConfig;
}

export interface WebhookConfig {
	url: string;
	notifications: {
		postUpload: boolean;
		postEdit: boolean;
		postDelete: boolean;
		error: boolean;
	}
}

export default {
	publicWebhook: {
		url: process.env.PUBLIC_WEBHOOK_URL,
		notifications: {
			postUpload: false,
			postEdit: false,
			postDelete: false,
			error: false
		}
	},
	privateWebhook: {
		url: process.env.PRIVATE_WEBHOOK_URL,
		notifications: {
			postUpload: false,
			postEdit: false,
			postDelete: false,
			error: true
		}
	}
} as ArgonConfig