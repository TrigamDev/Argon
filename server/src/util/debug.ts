export enum Category {
	server = '📡'
}

export enum Status {
	success = '🟢',
	warning = '🟡',
	error = '🔴',
	loading = "🕒"
}

export function log(category: Category, status: Status, message: string) {
	console.log(`${category} ${status}ㅤ${message}`)
}