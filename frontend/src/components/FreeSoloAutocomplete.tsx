import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import React from 'react';

type AutocompleteProps = {
	options: string[];
	label?: string;
	id?: string;
	value: string;
	setValue?: (value: string) => void;
};

export default function FreeSoloAutocomplete({
	options,
	label,
	id,
	value,
	setValue,
}: AutocompleteProps) {
	const [localValue, setLocalValue] = React.useState<string>(value);
	React.useEffect(() => {
		if (localValue !== value) {
			setLocalValue(value);
		}
	}, [value]);

	React.useEffect(() => {
		if (localValue !== value) {
			setValue?.(localValue);
		}
	}, [localValue]);

	return (
		<Autocomplete
			freeSolo
			id={id}
			options={options}
			value={localValue}
			defaultValue={null}
			isOptionEqualToValue={(option, val) => option === val}
			onChange={(_event, newValue) => {
				if (newValue) {
					setLocalValue(newValue);
				}
			}}
			onInputChange={(_event, newInputValue, reason) => {
				if (reason === 'reset') {
					return;
				}
				setLocalValue(newInputValue);
			}}
			selectOnFocus
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					size="small"
					name={id}
					required
					fullWidth
					style={{ marginTop: '8px' }}
				/>
			)}
		/>
	);
}
