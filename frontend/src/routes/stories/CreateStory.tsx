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
} from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { Sprint } from '../../api/sprints';
import {
	statuses,
	priorities,
	ticketTypes,
	StoryFormProps,
} from './stories.model';
import { User } from '../../api/users';
import UserSearchInput from '../sprints/UserSearchInput';
import { Epic } from '../epics/Epics';
import EpicSearchInput from './EpicSearchInput';
import { linkStoryToEpic } from '../../api/epics';
import { SubmitHandler, useController, useForm } from 'react-hook-form';
import { createStory, updateStory } from '../../api/stories';
import { queryClient } from '../../router';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';

export const CreateStory = () => {
	const navigate = useNavigate();
	const { register, handleSubmit, control } = useForm<StoryFormProps>();
	// we cannot use register('targetDate') in the mui datepicker
	// due the type mismatch
	const targetDateField = useController({ control, name: 'targetDate' });
	const descriptionField = useController({ control, name: 'description' });

	const [sprint, setSprint] = useState<Sprint | null>(null);
	const [assignedTo, setAssignedTo] = useState<User | null>(null);
	const [epic, setEpic] = useState<Epic | null>(null);

	const params = useParams();

	const onSubmit: SubmitHandler<StoryFormProps> = async (
		data: StoryFormProps
	) => {
		const estimated_completion_date = data.targetDate
			? data.targetDate.toISOString()
			: undefined;
		const story = await createStory({
			orgId: params.orgId as string,
			data: {
				title: data.title,
				description: data.description,
				item_type: 'story',
				iteration_id: sprint?.id,
				priority: data.priority,
				estimate: data.estimate ? +data.estimate : undefined,
				estimated_completion_date,
				status: data.status,
				item_sub_type: data.subType,
				assigned_to_id: assignedTo?.id,
			},
		});
		if (data.status && data.status !== 'not-started') {
			await updateStory({
				orgId: params.orgId as string,
				storyId: story.id,
				data: {
					start_date: new Date().toISOString(),
				},
			});
		}
		if (epic) {
			// assign epic to story using the /links endpoint
			await linkStoryToEpic({
				orgId: params.orgId as string,
				storyId: story.id,
				epicId: epic.id,
			});
		}
		await queryClient.invalidateQueries(
			{ queryKey: ['stories'] },
			{ throwOnError: true }
		);

		navigate(`/${params.orgId}/stories`);
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
					onSubmit={handleSubmit(onSubmit)}
					style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
				>
					<Grid container spacing={2} sx={{ flexGrow: 1 }}>
						<Grid item xs={8}>
							<FormControl
								sx={{
									width: '100%',
									paddingBottom: '14px',
								}}
							>
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									label="Title"
									id="title"
									required
									{...register('title')}
								></TextField>
							</FormControl>
							<DescriptionRichEditor
								onChange={descriptionField.field.onChange}
								value={descriptionField.field.value}
							/>
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
							<Typography
								variant="body1"
								className="!font-semibold text-neutral-regular text-left underline"
							>
								Ticket Relationship
							</Typography>
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

							<>
								<input
									hidden
									name="epic"
									value={epic?.id ?? ''}
									onChange={() => setAssignedTo(() => null)}
								/>
								<EpicSearchInput
									setEpic={setEpic}
									epic={epic}
									id="epic-selector"
									label="Epic"
								/>
							</>

							<>
								<input
									hidden
									name="assignedTo"
									value={assignedTo?.id ?? ''}
									onChange={() => setAssignedTo(() => null)}
								/>
								<UserSearchInput
									setUser={setAssignedTo}
									user={assignedTo}
									id="assignedTo-selector"
									label="Assigned to"
								/>
							</>

							<Typography
								variant="body1"
								className="!font-semibold text-left text-neutral-regular underline pt-8"
							>
								Ticket Fields
							</Typography>

							<TextField
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								type="number"
								label="Estimate"
								id="estimate"
								{...register('estimate')}
							/>

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
									id="status"
									defaultValue="not-started"
									{...register('status')}
								>
									{statuses.map((status) => (
										<MenuItem value={status.value} key={status.value ?? 'none'}>
											{status.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

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
									id="priority"
									{...register('priority')}
									defaultValue="low"
								>
									{priorities.map((priority) => (
										<MenuItem
											value={priority.value}
											key={priority.value ?? 'none'}
										>
											{priority.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl sx={{ width: '100%', marginTop: '4px' }}>
								<InputLabel size="small" id="subType-label">
									Type
								</InputLabel>
								<Select
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									labelId="subType-label"
									defaultValue="feature"
									label="Type"
									id="subType"
									{...register('subType')}
								>
									{ticketTypes.map((subType) => (
										<MenuItem value={subType.value} key={subType.value}>
											{subType.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<DatePicker
								label="Due Date"
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'small',
										margin: 'dense',
										fullWidth: true,
									},
								}}
								value={targetDateField.field.value}
								onChange={targetDateField.field.onChange}
							></DatePicker>
						</Grid>
					</Grid>
					<Box
						sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}
					>
						<Button
							variant="contained"
							sx={{ backgroundColor: 'neutral.lightest', color: 'black' }}
							color="neutral"
							onClick={() => navigate(-1)}
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
