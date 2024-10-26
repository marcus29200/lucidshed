import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEpics } from '../../api/epics';
import { CircularProgress } from '@mui/material';
import { Epic } from '../epics/Epics';

export default function EpicSearchInput({
	epic,
	setEpic,
	name,
	id,
	label = 'Epic',
}: {
	epic: Epic | null;
	setEpic?: (epic: Epic) => void;
	name?: string;
	id?: string;
	label?: string;
}) {
	const [value, setValue] = React.useState<Epic | null>(epic);
	const params = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['epics'],
		queryFn: async () => getEpics(params.orgId as string),
	});
	const items = data ?? [];
	const options = [...items];

	return (
		<Autocomplete
			value={value}
			defaultValue={null}
			onChange={(_event, newValue) => {
				setValue(() => newValue);
				setEpic && setEpic(newValue as Epic);
			}}
			filterOptions={(options, params) => {
				const { inputValue } = params;
				const filtered = options.filter((opt) =>
					opt.name.toLowerCase().includes(inputValue.toLowerCase())
				);

				return filtered;
			}}
			selectOnFocus
			clearOnBlur
			sx={{ minWidth: '200px' }}
			handleHomeEndKeys
			loading={isLoading}
			id={id}
			options={options}
			isOptionEqualToValue={(option, value) => option.epicId === value.epicId}
			getOptionLabel={(option) => {
				return option.name ?? '';
			}}
			renderOption={(props, option) => {
				const { key, ...optionProps } =
					props as React.HTMLAttributes<HTMLLIElement> & { key: string };
				return (
					<li key={key} {...optionProps} value={optionProps.id}>
						{option.name}
					</li>
				);
			}}
			renderInput={(params) => {
				return (
					<TextField
						{...params}
						label={label}
						size="small"
						name={name}
						fullWidth
						style={{ marginTop: '8px' }}
						InputProps={{
							sx: {
								backgroundColor: 'white',
							},
							...params.InputProps,
							endAdornment: (
								<React.Fragment>
									{isLoading ? (
										<CircularProgress color="inherit" size={20} />
									) : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				);
			}}
		/>
	);
}
