import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate, useParams } from 'react-router-dom';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprint, getSprints, getStoriesForSprint } from '../../api/sprints';
import { CircularProgress } from '@mui/material';
import { getStoriesProgress } from '../../shared/stories.mapper';

const getSprintRelatedStoriesQuery = (orgId: string, sprintId: string) =>
	queryOptions({
		queryKey: ['sprintRelatedStories-' + sprintId],
		queryFn: async () => getStoriesForSprint({ orgId, sprintId }),
	});

export default function SprintSearchInput({
	sprint,
	setSprint,
	name,
	id,
	enableAddNew,
	displayCompleteStatus,
	selectedSprintCompleted,
}: {
	sprint: Sprint | null;
	setSprint?: (sprint: Sprint) => void;
	name?: string;
	id?: string;
	enableAddNew?: boolean;
	displayCompleteStatus?: boolean;
	selectedSprintCompleted?: boolean;
}) {
	const [value, setValue] = React.useState<Sprint | null>(sprint);
	const params = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['sprints'],
		queryFn: async () => getSprints(params.orgId as string),
	});
	const queryClient = useQueryClient();
	const items = data ?? [];
	const options = enableAddNew
		? [{ title: 'Add new sprint', inputValue: 'add-new' }, ...items]
		: [...items];

	React.useEffect(() => {
		setValue(sprint);
	}, [sprint]);

	React.useEffect(() => {
		if (sprint) {
			setValue(() => ({
				...sprint!,
				title: !selectedSprintCompleted
					? sprint.title
					: sprint.title + ' (Completed)',
			}));
			for (let i = 0; i < items.length; i++) {
				if (items[i].id === sprint.id) {
					items[i].title = !selectedSprintCompleted
						? sprint.title
						: sprint.title + ' (Completed)';
					break;
				}
			}
		}
	}, [selectedSprintCompleted, sprint]);

	React.useEffect(() => {
		if (displayCompleteStatus && items.length) {
			for (let i = 0; i < items.length; i++) {
				queryClient
					.fetchQuery(
						getSprintRelatedStoriesQuery(params.orgId as string, items[i].id)
					)
					.then((stories) => {
						const progress = getStoriesProgress(stories).progress;
						if (progress === 100) {
							if (!items[i].title.includes('(Completed)')) {
								items[i].title += ' (Completed)';
							} else {
								items[i].title = items[i].title.replace(' (Completed)', '');
							}
							if (value?.id === items[i].id) {
								setValue((prev) => ({ ...prev!, title: items[i].title }));
							}
						}
					});
			}
		}
	}, [displayCompleteStatus, items]);

	const navigate = useNavigate();

	return (
		<Autocomplete
			value={value}
			defaultValue={null}
			onChange={(_event, newValue) => {
				if (enableAddNew && newValue?.inputValue === 'add-new') {
					return navigate(`/${params.orgId as string}/sprints/new`);
				}
				setValue(() => newValue);
				setSprint && setSprint(newValue);
			}}
			filterOptions={(options, params) => {
				const { inputValue } = params;
				const filtered = options.filter((opt) =>
					opt.title.toLowerCase().includes(inputValue.toLowerCase())
				);
				// Suggest the creation of a new value
				if (inputValue !== '' && filtered.length === 0 && enableAddNew) {
					filtered.push({
						inputValue: 'add-new',
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
			options={options}
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
				const { key, ...optionProps } =
					props as React.HTMLAttributes<HTMLLIElement> & { key: string };
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
