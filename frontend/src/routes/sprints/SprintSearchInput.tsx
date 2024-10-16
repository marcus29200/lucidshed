import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sprint, getSprints } from '../../api/sprints';
import { CircularProgress } from '@mui/material';

export default function SprintSearchInput({
	sprint,
	setSprint,
	name,
	id,
	redirectOnSelect = false,
	redirectOnNew,
}: {
	sprint: Sprint | null;
	setSprint?:
		| React.Dispatch<React.SetStateAction<Sprint>>
		| React.Dispatch<React.SetStateAction<Sprint | null>>;
	name?: string;
	id?: string;
	redirectOnSelect?: boolean;
	redirectOnNew?: boolean;
}) {
	const [value, setValue] = React.useState<Sprint | null>(sprint);
	const params = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['sprints'],
		queryFn: async () => getSprints(params.orgId as string),
	});
	const items = data ?? [];
	const navigate = useNavigate();
	return (
		<Autocomplete
			value={value}
			defaultValue={null}
			onChange={(_event, newValue) => {
				if (redirectOnNew && newValue?.inputValue === 'redirect-new') {
					return navigate('./new', { relative: 'path' });
				}
				if (redirectOnSelect) {
					return navigate(`./${newValue.id}`, { relative: 'path' });
				}
				setValue(() => newValue);
				setSprint && setSprint(() => newValue);
			}}
			filterOptions={(options, params) => {
				const { inputValue } = params;
				const filtered = options.filter((opt) =>
					opt.title.toLowerCase().includes(inputValue.toLowerCase())
				);
				// Suggest the creation of a new value
				if (inputValue !== '' && filtered.length === 0) {
					filtered.push({
						inputValue: 'redirect-new',
						title: `Add new sprint`,
					});
				}

				return filtered;
			}}
			selectOnFocus
			clearOnBlur
			sx={{ minWidth: '200px' }}
			handleHomeEndKeys
			loading={isLoading}
			id={id}
			options={[
				{ title: 'Add new sprint', inputValue: 'redirect-new' },
				...items,
			]}
			isOptionEqualToValue={(option, value) =>
				option.title === value || option.id === value.id
			}
			getOptionLabel={(option) => {
				if (option.inputValue) {
					return option.inputValue;
				}
				// Regular option
				return option?.title ?? '';
			}}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props;
				return (
					<li key={key} {...optionProps} value={optionProps.id}>
						{option.title}
					</li>
				);
			}}
			renderInput={(params) => {
				return (
					<TextField
						{...params}
						label="Sprint"
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
