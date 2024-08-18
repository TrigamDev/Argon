export enum Category {
	server = '📡',
	database = '🗄️ ',
	image = '🖼️',
	video = '🎥',
	audio = '🔊',
	project = '📄',
	unknown = '❓',
	upload = '📤',
	download = '📥',
	webhook = '🪝'
}

export enum Status {
	success = '🟢',
	warning = '🟡',
	error = '🔴',
	loading = "🕒"
}

export function log(
	category: Category, status: Status, message: string,
	newLine: boolean = false, startGroup: boolean = false, endGroup: boolean = false
) {
	if (startGroup) console.group(`${newLine ? '\n' : ''}${category} ${status}ㅤ${message}`)
	else console.log(`${newLine ? '\n' : ''}${category} ${status}ㅤ${message}`)

	if (endGroup) console.groupEnd()
}