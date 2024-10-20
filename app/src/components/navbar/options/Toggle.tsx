import type { ChangeEvent } from 'react';
import type { ToggleOption } from '../options';

import '@argon/components/navbar/options/option.css'
import '@argon/components/navbar/options/toggle.css'
import '@argon/globals.css'

interface Props {
	option: ToggleOption
}
export default function Toggle({ option }: Props) {
	const id = option.label.toLowerCase().replace(/ /g, '-')
	const toggleId = `${option.label}-toggle`

	function onToggle(event: ChangeEvent<HTMLInputElement>) {
		let newValue = event.target.checked
		if (option.set) option.set(newValue)
	}

	return (
		<label id={toggleId} className="option toggle" tabIndex={0}>
			<div className="option-content">
				<span className="option-label">{option.label}</span>
				<input id={id} type="checkbox" role="checkbox" className="toggle-checkbox" defaultChecked={option.toggled}
					onChange={(event) => onToggle(event)}
				/>
				<div className="toggle-track">
					<div className="toggle-thumb"/>
				</div>
			</div>
			<div className="option-description">
				<span className="description-text">{option.description}</span>
			</div>
		</label>
	)
}