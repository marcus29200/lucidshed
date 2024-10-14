import {
	Box,
	FormControl,
	Grid,
	InputLabel,
	Select,
	TextField,
	Typography,
	MenuItem,
	Button,
	FormControlLabel,
	Checkbox,
} from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import {
	ActionFunctionArgs,
	Form,
	redirect,
	useNavigate,
} from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers';
import { QueryClient } from '@tanstack/react-query';
import { createStory } from '../../api/stories';
import { useState } from 'react';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { Sprint } from '../../api/sprints';
import { Priority } from '../../api/epics';

const METADATA_FIELD_OPTIONS = {
	targetDate: 'Due Date',
	estimate: 'Estimate',
	status: 'Status',
	priority: 'Priority',
	subType: 'Type',
	sprint: 'Sprint',
	tags: 'Tags',
	attachment: 'Attachments',
} as const;

type MetadataFieldOption = keyof typeof METADATA_FIELD_OPTIONS;

export const statuses = [
	{
		label: 'Not started',
		value: 'not-started',
	},
	{
		label: 'In progress',
		value: 'in-progress',
	},
	{
		label: 'Done',
		value: 'done',
	},
];
export const priorities = [
	{
		label: 'Critical',
		value: 'critical',
	},
	{
		label: 'High',
		value: 'high',
	},
	{
		label: 'Medium',
		value: 'medium',
	},
	{
		label: 'Small',
		value: 'low',
	},
];

export const action = (queryClient: QueryClient) => {
	return async ({ request, params }: ActionFunctionArgs) => {
		const formData = await request.formData();

		const data = Object.fromEntries(formData.entries());
		console.log('what the hell is this data yo: ', data);
		const estimated_completion_date = data.targetDate
			? new Date(data.targetDate.toString()).toISOString()
			: undefined;
		await createStory({
			orgId: params.orgId as string,
			data: {
				title: data.title as string,
				description: data.description as string,
				item_type: 'story',
				iteration_id: data.sprint ? +data.sprint : undefined,
				priority: data.priority as Priority,
				estimate: data.estimate ? +data.estimate : undefined,
				estimated_completion_date,
				status: data.status as string,
			},
		});
		await queryClient.invalidateQueries(
			{ queryKey: ['stories'] },
			{ throwOnError: true }
		);

		return redirect(`/${params.orgId}/stories`);
	};
};

export const CreateStory = () => {
	const navigate = useNavigate();
	const [sprint, setSprint] = useState<Sprint | null>(null);

	const [selectedFields, setSelectedFields] = useState<MetadataFieldOption[]>(
		[]
	);

	const handleFieldToggle = (field: MetadataFieldOption) => {
		setSelectedFields((prevSelected) =>
			prevSelected.includes(field)
				? prevSelected.filter((item) => item !== field)
				: [...prevSelected, field]
		);
	};

	return (
		<FullHeightSection>
			<Box
				sx={{
					padding: '20px',
					minHeight: 'calc(100vh - 200px)',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Typography variant="subtitle1" align="left">
					Create New Story
				</Typography>
				<Typography
					variant="subtitle2"
					color="neutral.light"
					align="left"
					sx={{ marginBottom: '16px' }}
				>
					Fill out the following details to create a new story
				</Typography>
				<Typography variant="body1" align="left">
					Basic Details
				</Typography>
				<Form
					method="post"
					style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
				>
					<Grid container spacing={2} sx={{ flexGrow: 1 }}>
						<Grid item xs={8}>
							<TextField
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								label="Title"
								id="title"
								name="title"
								required
							></TextField>
							<TextField
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								label="Description"
								id="description"
								name="description"
								multiline
								minRows={8}
							></TextField>
						</Grid>
						<Grid
							item
							xs={4}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							<FormControl>
								<InputLabel
									sx={{
										color: 'gray',
										textAlign: 'left',
										fontFamily: 'Poppins, sans-serif',
									}}
									htmlFor="add-ticket-details-label"
								>
									Add Ticket Details
								</InputLabel>
								<Select
									id="add-ticket-details-label"
									sx={{ marginTop: 1.2, borderRadius: `8px`, paddingY: 1 }}
									multiple
									value={selectedFields}
									onChange={(e) => {
										setSelectedFields(
											typeof e.target.value === 'string'
												? (e.target.value.split(',') as MetadataFieldOption[])
												: e.target.value
										);
									}}
									renderValue={(selected) =>
										selected.map((s) => METADATA_FIELD_OPTIONS[s]).join(', ')
									}
									fullWidth
									size="small"
								>
									{Object.keys(METADATA_FIELD_OPTIONS).map((field) => (
										<MenuItem
											key={field}
											value={field}
											sx={{ height: '30px' }}
											onClick={() =>
												handleFieldToggle(field as MetadataFieldOption)
											}
										>
											<FormControlLabel
												control={
													<Checkbox
														checked={selectedFields.includes(
															field as MetadataFieldOption
														)}
													/>
												}
												label={
													METADATA_FIELD_OPTIONS[field as MetadataFieldOption]
												}
											/>
										</MenuItem>
									))}
								</Select>
							</FormControl>
							{/* THIS IS WHERE WE ADD ALL OF OUR FIELDS */}
							{selectedFields.includes('targetDate') && (
								<DatePicker
									label="Due Date"
									name="targetDate"
									slotProps={{
										textField: {
											variant: 'outlined',
											size: 'small',
											margin: 'dense',
											fullWidth: true,
										},
									}}
								></DatePicker>
							)}
							{selectedFields.includes('estimate') && (
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									type="number"
									label="Estimate"
									id="estimate"
									name="estimate"
								/>
							)}

							{selectedFields.includes('status') && (
								<FormControl sx={{ width: '100%', marginTop: '4px' }}>
									<InputLabel size="small" id="status-label">
										Status
									</InputLabel>
									<Select
										variant="outlined"
										size="small"
										margin="dense"
										fullWidth
										labelId="status-label"
										label="Status"
										defaultValue={'not-started'}
										id="status"
										name="status"
									>
										{statuses.map((status) => (
											<MenuItem value={status.value} key={status.value}>
												{status.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}

							{selectedFields.includes('priority') && (
								<FormControl sx={{ width: '100%', marginTop: '4px' }}>
									<InputLabel size="small" id="priority-label">
										Priority
									</InputLabel>
									<Select
										variant="outlined"
										size="small"
										margin="dense"
										fullWidth
										labelId="priority-label"
										label="Priority"
										defaultValue={'low'}
										id="priority"
										name="priority"
									>
										{priorities.map((priority) => (
											<MenuItem value={priority.value} key={priority.value}>
												{priority.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}
							{selectedFields.includes('sprint') && (
								<>
									<input
										hidden
										name="sprint"
										value={sprint?.id ?? ''}
										onChange={() => setSprint(() => null)}
									/>
									<SprintSearchInput
										setSprint={setSprint}
										sprint={sprint}
										id="sprint-selector"
									/>
								</>
							)}

							{selectedFields.includes('attachment') && (
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									label="Attachments"
									id="attachments"
									name="attachments"
								/>
							)}
							{selectedFields.includes('tags') && (
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									label="Tags"
									id="tags"
									name="tags"
								/>
							)}
							{/* TODO: owner */}
							{/* TODO: assignee */}
						</Grid>
					</Grid>
					<Box
						sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}
					>
						<Button
							variant="contained"
							sx={{ backgroundColor: 'neutral.lightest', color: 'black' }}
							color="neutral"
							onClick={() => navigate('..', { relative: 'path' })}
						>
							Cancel
						</Button>
						<Button variant="contained" type="submit">
							Create Story
						</Button>
					</Box>
				</Form>
			</Box>
		</FullHeightSection>
	);
};
