import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { mapUser, User } from '../../api/users';
import { UsersContext } from '../../hooks/users';
import { useRouteLoaderData } from 'react-router-dom';
import { useAuth, AuthContextValue } from '../../hooks/auth';

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
	const { user: localApiUser } = useAuth() as AuthContextValue;
	const localUser = mapUser(localApiUser);
	let currentUser: User = useRouteLoaderData('user') as User;
	currentUser =
		currentUser?.id === localUser?.id ? localUser || currentUser : currentUser; // if no current user, use the local user

	const users = React.useContext(UsersContext);
	const [value, setValue] = React.useState<User | null>(user);
	React.useEffect(() => {
		setValue(user);
	}, [user]);

	// first option is always current user
	const items = [
		currentUser,
		...users.filter((user) => user.id !== currentUser.id),
	];

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
				const filtered = options?.filter((opt) =>
					opt?.firstName?.toLowerCase()?.includes?.(inputValue?.toLowerCase())
				);
				return filtered;
			}}
			selectOnFocus
			clearOnBlur
			sx={{ minWidth: '200px' }}
			handleHomeEndKeys
			id={id}
			options={items}
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
						{option.id === currentUser.id && (
							<span className="text-neutral-regular font-semibold text-xs">
								(You)
							</span>
						)}
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
