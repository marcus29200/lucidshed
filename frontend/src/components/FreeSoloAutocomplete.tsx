import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export type AutocompleteOption = {
	label: string;
	value: string;
};

type AutocompleteProps = {
	options: AutocompleteOption[];
	label?: string;
	id?: string;
	value: AutocompleteOption | null;
	setValue?: (value: AutocompleteOption | null) => void;
};

export default function FreeSoloAutocomplete({
	options,
	label,
	id,
	value,
	setValue,
}: AutocompleteProps) {
	console.log({ value });

	return (
		<Autocomplete
			freeSolo
			id={id}
			options={options}
			value={value}
			defaultValue={null}
			onChange={(_event, newValue) => {
				console.log(newValue);

				if (typeof newValue === 'string') {
					setValue?.({ label: newValue, value: newValue });
				} else if (newValue) {
					// Handle the case where a valid option is selected
					setValue?.(newValue);
				}
			}}
			onKeyUp={(event) => {
				const newValue = event.target['value'];
				if (event.target['value'] !== undefined) {
					setValue?.({ label: newValue, value: newValue });
				}
			}}
			filterOptions={(options, params) => {
				const { inputValue } = params;
				const filtered = options.filter((opt) =>
					opt.label.toLowerCase().includes(inputValue.toLowerCase())
				);
				return filtered;
			}}
			isOptionEqualToValue={(option, value) => option.value === value.value}
			getOptionLabel={(option) => {
				// Handle the case where a string is entered directly
				if (typeof option === 'string') {
					return option;
				}
				// Otherwise, return the label of the option
				return option.label;
			}}
			renderOption={(props, option) => {
				const { key, ...optionProps } =
					props as React.HTMLAttributes<HTMLLIElement> & { key: string };
				return (
					<li key={key} {...optionProps} value={optionProps.id}>
						{option.label}
					</li>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					size="small"
					name={id}
					fullWidth
					style={{ marginTop: '8px' }}
				/>
			)}
		/>
	);
}
