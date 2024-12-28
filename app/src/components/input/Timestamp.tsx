import { useEffect, useState } from "react"

import type { Value } from "node_modules/react-datetime-picker/dist/esm/shared/types"

import DateTimePicker from "react-datetime-picker"

import "react-datetime-picker/dist/DateTimePicker.css"
import "react-calendar/dist/Calendar.css"
import "react-clock/dist/Clock.css"

import "@argon/components/input/timestamp.css"
import "@argon/globals.css"

interface Props {
	currentTimestamp?: number,
	resetButton?: boolean,
	onChange: ( ( value: Value ) => void )
}
export default function Timestamp({ currentTimestamp = new Date().getTime(), resetButton = true, onChange }: Props) {

	const [currentValue, setCurrentValue] = useState<Value>(new Date(currentTimestamp))

	useEffect(() => {
		setCurrentValue( new Date( currentTimestamp ) )
	}, [ currentTimestamp ])

	function onInputChange(value: Value) {
		setCurrentValue(value)
		onChange(value)
	}

	function revert() {
		setCurrentValue(new Date(currentTimestamp))
	}

	return (
		<div className="timestamp-input input-field">
			<DateTimePicker className="time-picker" value={ currentValue } onChange={ onInputChange }
				disableClock={true}
			/>
			{ currentTimestamp != currentValue?.getTime() && resetButton &&
				<button className='revert-change' onClick={revert}>
					<img className='revert-icon' src="/icons/actions/revert.svg"/>
				</button>
			}
		</div>
	)
}