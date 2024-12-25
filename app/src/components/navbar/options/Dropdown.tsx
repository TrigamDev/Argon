import { useState } from "react"

import type { SingleValue } from "react-select"
import type { DropdownOption, DropdownSelection } from "@argon/options"

import { labelToId } from "@argon/options"

import Select from "react-select"

import "@argon/components/navbar/options/option.css"
import "@argon/components/navbar/options/dropdown.css"
import "@argon/globals.css"

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
		<button id={id} className="option drop-down" tabIndex={0} onClick={toggleMenu}>
			<div className="option-content">
				<h3 className="option-label">{option.label}</h3>
			</div>
			<p className="option-description">
				<span className="description-text">{option.description}</span>
			</p>

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
					menu: () => "dropdown-menu pop-up",
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
		</button>
	)
}