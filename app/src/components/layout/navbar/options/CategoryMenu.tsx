import type { Category } from "../options";

import '@argon/components/layout/navbar/options/option.css'
import '@argon/components/layout/navbar/options/category.css'
import '@argon/globals.css'
import OptionsMenu from "./OptionsMenu";

interface Props {
	category: Category
}
export default function CategoryMenu({ category }: Props) {
	const id = category.label.toLowerCase().replace(/ /g, '-')

	return (
		<div className="category-container astronav-dropdown-submenu">
			<button className="option category open" id={id} onClick={() => {}}>
				<div className="option-content">
					<span className="option-label">{category.label}</span>
					<img src="/icons/nav/dropdown.svg" alt="Dropdown" className="option-icon dropdown-icon"/>
				</div>
				<div className="option-description">
					<span className="description-text">{category.description}</span>
				</div>
			</button>
			<div className="category-children dropdown-toggle hidden">
				<OptionsMenu optionsList={category.children}/>
			</div>
		</div>
	)
}