import { useEffect, useState, type ChangeEvent } from "react"

import "@argon/components/input/text.css"
import "@argon/globals.css"

interface Props {
	currentText?: string,
	resetButton?: boolean,
	disabled?: boolean,
	onChange: ( ( value: string ) => void )
}
export default function Text({ currentText = "", resetButton = true, disabled = false, onChange }: Props) {

	const [ currentValue, setCurrentValue ] = useState<string>("")

	useEffect(() => {
		setCurrentValue( currentText )
	}, [ currentText ])

	function onInputChange( event: ChangeEvent<HTMLInputElement> ) {
		setCurrentValue( event.target.value )
		onChange( event.target.value )
	}

	function revert() {
		setCurrentValue( currentText )
	}

	return (
		<div className="text-input input-field">
			<input role='textbox' className="text-box"
				value={ currentValue ?? "" } disabled={ disabled }
				onChange={ onInputChange }
			/>
			{ currentText != currentValue && resetButton &&
				<button className='revert-change' onClick={ revert }>
					<img className='revert-icon' src="/icons/actions/revert.svg"/>
				</button>
			}
		</div>
	)
}