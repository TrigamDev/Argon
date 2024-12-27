import type { FormEvent } from "react"

import { useStore } from "@nanostores/react"

import type { ToggleOption } from "@argon/options"

import "@argon/components/navbar/options/option.css"
import "@argon/components/navbar/options/toggle.css"
import "@argon/globals.css"

interface Props {
	option: ToggleOption
}
export default function Toggle({ option }: Props) {
	const id = option.label.toLowerCase().replace(/ /g, '-')
	const toggleId = `${option.label}-toggle`

	function onToggle(event: FormEvent<HTMLInputElement>) {
		let newValue = (event as any).target.checked
		if (option.set) option.set(newValue)
	}

	const $toggled = useStore( option.store )

	return (
		<label id={toggleId} className="option toggle" tabIndex={0}>
			<div className="option-content">
				<h3 className="option-label">{option.label}</h3>
				<input
					id={id} type="checkbox" role="checkbox"
					className="toggle-checkbox" defaultChecked={ $toggled }
					onInput={(event) => onToggle(event)}
				/>
				<div className="toggle-track">
					<div className="toggle-thumb"/>
				</div>
			</div>
			<p className="option-description">
				<span className="description-text">{option.description}</span>
			</p>
		</label>
	)
}