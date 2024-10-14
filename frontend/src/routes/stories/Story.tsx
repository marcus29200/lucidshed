import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
	ActionFunctionArgs,
	Form,
	LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useNavigate,
} from 'react-router-dom';
import { getStory, updateStory } from '../../api/stories';
import FullHeightSection from '../../components/FullHeightSection';
import {
	Box,
	Button,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { priorities, statuses } from './stories.model';

export const storyQuery = (orgId: string, storyId: string) =>
	queryOptions({
		queryKey: ['story', orgId, storyId],
		queryFn: async () => getStory(orgId, storyId),
	});

export const loader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, storyId } = params;
		if (!orgId || !storyId) {
			throw new Error('Missing orgId or story id');
		}
		return queryClient.fetchQuery(storyQuery(orgId, storyId));
	};
};

export const action = (queryClient: QueryClient) => {
	return async ({ request, params }: ActionFunctionArgs) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		console.log('what the hell is this data yo: ', data);
		const estimated_completion_date = data?.targetDate
			? new Date(data?.targetDate).toISOString()
			: undefined;
		const submissionData: any = {
			title: data.title,
			description: data.description,
			item_type: 'story',
			iteration_id: data.sprint ?? undefined,
			estimated_completion_date,
		};
		if (data?.status) {
			submissionData.status = data?.status;
		}

		if (data?.priority) {
			submissionData.priority = data?.priority;
		}
		if (data?.estimate) {
			submissionData.estimate = data?.estimate;
		}

		await updateStory({
			orgId: params.orgId as string,
			storyId: params.id as string,
			data: submissionData,
		});
		await queryClient.invalidateQueries({
			queryKey: ['story', params.orgId, params.id],
		});
		return redirect('..');
	};
};
export const Story = () => {
	const story = useLoaderData();
	const navigate = useNavigate();
	const [title, setTitle] = useState(story.title ?? '');
	const [description, setDescription] = useState(story.description ?? '');
	const [status, setStatus] = useState(story.status);
	const [priority, setPriority] = useState(story.priority ?? '');
	const [estimate, setEstimate] = useState(story.estimate);
	const [targetDate, setTargetDate] = useState(
		new Date(story.estimated_completion_date)
	);
	const [sprint, setSprint] = useState(story.iteration ?? '');
	console.log('the story: ', story, targetDate);
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
								value={title}
								onChange={(e) => setTitle(e.target.value)}
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
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Grid>
						<Grid item xs={4}>
							{/* THIS IS WHERE WE ADD ALL OF OUR FIELDS */}
							<input type="hidden" value={sprint?.id} name="sprint" />
							<SprintSearchInput
								setSprint={setSprint}
								sprint={sprint}
								id="sprint-selector"
							/>
							<DatePicker
								label="Due Date"
								name="targetDate"
								value={targetDate}
								onChange={(e) => setTargetDate(e)}
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'small',
										margin: 'dense',
										fullWidth: true,
									},
								}}
							></DatePicker>
							<TextField
								value={estimate}
								onChange={(e) => setEstimate(e.target.value)}
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								type="number"
								label="Estimate"
								id="estimate"
								name="estimate"
							/>
							<FormControl sx={{ width: '100%', marginTop: '4px' }}>
								<InputLabel size="small" id="priority-label">
									Priority
								</InputLabel>
								<Select
									value={priority}
									onChange={(e) => setPriority(e.target.value)}
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
							<FormControl sx={{ width: '100%', marginTop: '4px' }}>
								<InputLabel size="small" id="status-label">
									Status
								</InputLabel>
								<Select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
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
							<TextField
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								label="Attachments"
								id="attachments"
								name="attachments"
							/>

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
							Go back
						</Button>
						<Button variant="contained" type="submit">
							Save changes
						</Button>
					</Box>
				</Form>
			</Box>
		</FullHeightSection>
	);
};
