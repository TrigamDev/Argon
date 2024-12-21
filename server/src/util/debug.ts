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

export enum Group {
	start,
	end
}

interface LogSettings {
	category: Category
	status: Status
	message: string
	newLine?: boolean
	group?: Group
}
export function log({
	category, status, message,
	newLine = false, group
}: LogSettings) {
	if (group === Group.start) console.group(`${newLine ? '\n' : ''}${category} ${status}ㅤ${message}`)
	else console.log(`${newLine ? '\n' : ''}${category} ${status}ㅤ${message}`)

	if (group === Group.end) console.groupEnd()
}