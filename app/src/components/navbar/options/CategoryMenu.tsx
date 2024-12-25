import type { Category } from "@argon/options"

import OptionsMenu from "@argon/components/navbar/options/OptionsMenu"

import '@argon/components/navbar/options/option.css'
import '@argon/components/navbar/options/category.css'
import '@argon/globals.css'

interface Props {
	category: Category
}
export default function CategoryMenu({ category }: Props) {
	const id = category.label.toLowerCase().replace(/ /g, '-')

	return (
		<div className="category-container astronav-dropdown-submenu">
			{ /* Option */ }
			<button className="option category open" id={id} onClick={() => {}}>
				<div className="option-content">
					<h2 className="option-label">{category.label}</h2>
					<img src="/icons/nav/dropdown.svg" alt="Dropdown" className="option-icon dropdown-icon"/>
				</div>
				<p className="option-description">
					<span className="description-text">{category.description}</span>
				</p>
			</button>
			{ /* Dropdown */ }
			<div className="category-children dropdown-toggle hidden">
				<OptionsMenu optionsList={category.children}/>
			</div>
		</div>
	)
}