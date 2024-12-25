import type { Option, ToggleOption, DropdownOption, Category } from "@argon/options"

import Options, { labelToId, OptionType } from "@argon/options"

import Toggle from "@argon/components/navbar/options/Toggle.tsx"
import CategoryMenu from "@argon/components/navbar/options/CategoryMenu.tsx"
import Dropdown from "@argon/components/navbar/options/Dropdown.tsx"

interface Props {
	optionsList?: Option[]
}
export default function OptionsMenu({ optionsList }: Props) {
	let displayOptions = optionsList ?? Options
	return (
		<ul>
			{ displayOptions && displayOptions.map(option => {
				// Toggles
				if (option.type == OptionType.Toggle) {
					return <Toggle
						key={labelToId(option.label)}
						option={option as ToggleOption}
					/>
				} else if (option.type == OptionType.Dropdown) {
					return <Dropdown
						key={labelToId(option.label)}
						option={option as DropdownOption<any>}
					/>
				} else if (option.type == OptionType.Category) {
					return <CategoryMenu
						key={labelToId(option.label)}
						category={option as Category}
					/>
				}
			}) }
		</ul>
	)
}