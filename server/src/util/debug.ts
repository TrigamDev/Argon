export enum Category {
	server = '📡',
	database = '🗄️ ',
	image = '🖼️',
	video = '🎥',
	audio = '🔊',
	project = '📄',
	unknown = '❓',
	upload = '📤',
	download = '📥'
}

export enum Status {
	success = '🟢',
	warning = '🟡',
	error = '🔴',
	loading = "🕒"
}

export function log(category: Category, status: Status, message: string, newLine: boolean = false) {
	console.log(`${newLine ? '\n' : ''}${category} ${status}ㅤ${message}`)
}