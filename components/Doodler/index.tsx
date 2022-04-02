import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import classes from './index.module.scss'

const howManyDays = 371
const howManyValues = 5

const S = 1000
const M = 60 * S
const H = 60 * M
const D = 24 * H


const getPreviousSunday = (date: Date = new Date()) => {
	const d = new Date(date);
	d.setDate(d.getDate() + (7-d.getDay())%7);
	return d
}
const dateAsString = (d: Date) => {
	return d.toISOString().substring(0, 10)
}


const Doodler: React.FC = () => {
	const [startDate, setStartDate] = useState<Date>(getPreviousSunday())
	const [days, setDays] = useLocalStorage<number[]>('currentDoodle', new Array(howManyDays).fill(0))
	const [isDisabled, setDisabled] = useState(false)

	const changeHandler = (e) => {
        if(!e.target?.name) return
		e.preventDefault()
		const i = parseInt(e.target.name.split('-')[1])
		const newDays = [...days]
		const direction = e.button === 2 ? 1 : -1
		newDays[i] = (newDays[i] + howManyValues + direction) % howManyValues
		setDays(newDays)
	}
	
	const goRight = () => {
		const newDays = [...days.slice(7, days.length), ...days.slice(0, 7)]
		setDays(newDays)
	}
	const goLeft = () => {
		const min7 = days.length - 7
		const newDays = [...days.slice(min7, days.length), ...days.slice(0, min7)]
		setDays(newDays)
	}
	
	const apply = async () => {
		if( !confirm(`Do you know what you are doing ?\n\nBecause I don't...`)) return

		console.log({ startDate })

		const isoDates = days.reduce<string[]>((acc, v, i) => {
			for (let c = 0; c < v; c++) {
				acc.push(new Date(+startDate + i*D).toISOString().substring(0, 10))
			}
			return acc
		}, [])

		setDisabled(true)

		fetch('/api/apply', {
			method: 'POST',
			body: JSON.stringify({
				dates: isoDates
			}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }})
			.then(res => res.json())
			.then(() => {
				setDisabled(false)
			})
			.catch(() => {
				alert('something went wrong. check your git history, and debug...')
			})
	}

	
	return (
		<fieldset disabled={isDisabled}>
			<legend><input type="date" value={dateAsString(startDate)} onChange={(e) => {
				setStartDate(getPreviousSunday(new Date(e.currentTarget.value)))
			}}/></legend>
			<div className={classes.days} onMouseDown={changeHandler} onContextMenu={(e) => e.preventDefault()}>
			{days.map( (value, i) => (
				<input key={i} name={`input-${i}`} type="button" value={value} />
			) )}
			</div>
			<hr />
			<div>
				<button type="button" onClick={goRight}>&lt;</button>
				<button type="button" onClick={goLeft}>&gt;</button>
			</div>
			<hr />
			<div>
				<button type="button" onClick={apply}>Apply</button>
			</div>
		</fieldset>
	)
}

export default Doodler