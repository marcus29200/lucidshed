import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';
import { getUsers, User } from '../../api/users';
import { useParams } from 'react-router-dom';

export default function UserSearchInput({
	user,
	setUser,
	name,
	id,
	label,
}: {
	user: User | null;
	setUser?: (user: User) => void;
	name?: string;
	id?: string;
	label?: string;
}) {
	const [value, setValue] = React.useState<User | null>(user);
	const params = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['users'],
		queryFn: async () => getUsers(params.orgId as string),
	});

	const items = data ?? [];
	const options = [...items];

	return (
		<Autocomplete
			value={value}
			defaultValue={null}
			onChange={(_event, newValue) => {
				setValue(() => newValue);
				setUser && setUser(newValue as User);
			}}
			filterOptions={(options, params) => {
				const { inputValue } = params;
				const filtered = options.filter((opt) =>
					opt.firstName.toLowerCase().includes(inputValue.toLowerCase())
				);
				// Suggest the creation of a new value
				// if (inputValue !== '' && filtered.length === 0 && enableAddNew) {
				// 	filtered.push({
				// 		inputValue: 'add-new',
				// 		title: `Add new user`,
				// 	});
				// }

				return filtered;
			}}
			selectOnFocus
			clearOnBlur
			sx={{ minWidth: '200px' }}
			handleHomeEndKeys
			loading={isLoading}
			id={id}
			options={options}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			getOptionLabel={(option) => {
				// Regular option
				return option?.fullName ?? '';
			}}
			renderOption={(props, option) => {
				const { key, ...optionProps } =
					props as React.HTMLAttributes<HTMLLIElement> & { key: string };
				return (
					<li key={key} {...optionProps} value={optionProps.id}>
						{option.fullName}
					</li>
				);
			}}
			renderInput={(params) => {
				return (
					<TextField
						{...params}
						label={label ?? 'User'}
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
