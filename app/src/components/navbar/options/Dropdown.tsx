import { useState } from 'react';

import { labelToId } from '../options';
import type { DropdownOption, DropdownSelection } from '../options';

import Select, { type SingleValue } from 'react-select';

import '@argon/components/navbar/options/option.css'
import '@argon/components/navbar/options/dropdown.css'
import '@argon/globals.css'

interface Props {
	option: DropdownOption<any>
}
export default function Dropdown({ option }: Props) {
	const id = labelToId(option.label)
	const selectId = `${id}-select`

	const [selected, setSelected] = useState(
		option.options.filter(
			potentialChoice => potentialChoice.selected == true
		)[0] as DropdownSelection<any>
	)
	const [menuIsOpen, setMenuIsOpen] = useState(false)

	function toggleMenu() {
		setMenuIsOpen(!menuIsOpen)
	}

	function onChange(selectedValue: SingleValue<{ label: string, value: string }>) {
		if (!selectedValue) return

		let chosenOption = getChoiceFromValue(selectedValue.value)
		if (option.set) option.set(chosenOption.value)
		setSelected(chosenOption)
		setMenuIsOpen(false)
	}

	function getChoiceFromValue(value: string) {
		let possibleChoices = option.options.filter(choice => choice.value == value)
		return possibleChoices[0]
	}

	return (
		<div id={id} className="option toggle" tabIndex={0} onClick={toggleMenu}>
			<div className="option-content">
				<span className="option-label">{option.label}</span>
			</div>
			<div className="option-description">
				<span className="description-text">{option.description}</span>
			</div>

			<Select
				id={selectId} className="dropdown-container" instanceId={selectId} inputId={`${selectId}-input`}
				tabIndex={1}
				captureMenuScroll={true}
				required={true}
				menuIsOpen={menuIsOpen}
				openMenuOnClick={true}
				openMenuOnFocus={true}
				options={option?.options?.map(choice => ({ label: choice.label, value: choice.value }) )}
				defaultValue={{ label: selected.label, value: selected.value }}
				onChange={(value) => onChange(value)}
				classNames={{
					control: () => "dropdown",
					menu: () => "dropdown-menu",
					menuList: () => "astronav-dropdown-submenu",
					option: () => "dropdown-choice dont-close",
					input: () => "dont-close",
					singleValue: () => "dropdown-value",
					indicatorSeparator: () => "separator"
				}}
			/>
			<div className="option-description dropdown-choice-description">
				<span className="description-text">{selected.description}</span>
			</div>
		</div>
	)
}