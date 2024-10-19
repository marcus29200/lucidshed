import { Form, useLoaderData, useNavigate } from 'react-router-dom';
import FullHeightSection from '../../components/FullHeightSection';
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import {
	METADATA_FIELD_OPTIONS,
	MetadataFieldOption,
	priorities,
	statuses,
	ticketTypes,
} from './stories.model';
import { StoryAPI } from '../../api/stories';
import { mapPayloadToSprint, Sprint } from '../../api/sprints';
import dayjs from 'dayjs';
import UserComments from '../../components/UserComments';
import {
	createComment,
	CreateCommentPayload,
	getAllComments,
	mapRawComment,
	UserComment,
} from '../../api/comments';
import UserSearchInput from '../sprints/UserSearchInput';
import { mapUser, User } from '../../api/users';

export const Story = () => {
	const story = useLoaderData() as StoryAPI;
	const navigate = useNavigate();
	const [title, setTitle] = useState(story.title ?? '');
	const [description, setDescription] = useState(story.description ?? '');
	const [comments, setComments] = useState<UserComment[]>([]);
	const [sprint, setSprint] = useState<Sprint | null>(
		mapPayloadToSprint(story.iteration) ?? null
	);

	const [assignee, setAssignee] = useState<User | null>(
		mapUser(story.assigned_to) ?? null
	);

	useEffect(() => {
		getAllComments({ orgId: story.organization_id, workItemId: story.id }).then(
			(comments) => {
				setComments(comments);
			}
		);
	}, [story]);

	const [dynamicFields, setDynamicFields] = useState<any>({
		priority: story.priority,
		status: story.status,
		estimate: story.estimate,
		subType: story.item_sub_type,
		targetDate: story.estimated_completion_date
			? dayjs(story.estimated_completion_date).toDate()
			: undefined,
	});
	const [selectedFields, setSelectedFields] = useState<MetadataFieldOption[]>(
		[]
	);

	useEffect(() => {
		const fieldsWithValues = Object.keys(dynamicFields).filter(
			(field) => !!dynamicFields[field as MetadataFieldOption]
		);
		if (sprint) {
			fieldsWithValues.push('sprint');
		}
		if (assignee) {
			fieldsWithValues.push('assignee');
		}
		setSelectedFields(fieldsWithValues as MetadataFieldOption[]);
	}, [dynamicFields, sprint, assignee]);

	const handleFieldToggle = (field: MetadataFieldOption) => {
		setSelectedFields((prevSelected) =>
			prevSelected.includes(field)
				? prevSelected.filter((item) => item !== field)
				: [...prevSelected, field]
		);
	};

	const handleAddComment = (newComment: CreateCommentPayload) => {
		createComment({
			orgId: story.organization_id,
			workItemId: story.id,
			data: newComment,
		}).then((comment) => {
			setComments((prev) => [...prev, mapRawComment(comment)]);
		});
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
				<Grid container spacing={2} sx={{ paddingBottom: '20px' }}>
					<Grid item xs={8}>
						<Typography variant="body1" align="left">
							Basic Details
						</Typography>
					</Grid>
					<Grid item xs={4}>
						<Button variant="contained" color="success" onClick={() => {}}>
							Ticket Metadata
						</Button>
					</Grid>
				</Grid>

				<Form
					method="post"
					style={{
						display: 'flex',
						flexDirection: 'column',
						flexGrow: 1,
						paddingBottom: '20px',
					}}
				>
					<Grid container spacing={2} sx={{ flexGrow: 1 }}>
						<Grid item xs={8}>
							<TextField
								variant="outlined"
								size="small"
								required
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
									value={dynamicFields.targetDate}
									onChange={(e) =>
										setDynamicFields({
											...dynamicFields,
											targetDate: e,
										})
									}
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
									value={dynamicFields.estimate}
									onChange={(e) =>
										setDynamicFields({
											...dynamicFields,
											estimate: e.target.value,
										})
									}
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
										value={dynamicFields.status}
										onChange={(e) =>
											setDynamicFields({
												...dynamicFields,
												status: e.target.value,
											})
										}
									>
										{statuses.map((status) => (
											<MenuItem
												value={status.value}
												key={status.value ?? 'none'}
											>
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
										id="priority"
										name="priority"
										value={dynamicFields.priority}
										onChange={(e) =>
											setDynamicFields({
												...dynamicFields,
												priority: e.target.value,
											})
										}
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
							)}
							{selectedFields.includes('subType') && (
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
										label="Type"
										id="subType"
										name="subType"
										value={dynamicFields.subType}
										onChange={(e) =>
											setDynamicFields({
												...dynamicFields,
												subType: e.target.value,
											})
										}
									>
										{ticketTypes.map((subType) => (
											<MenuItem value={subType.value} key={subType.value}>
												{subType.label}
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
							{selectedFields.includes('assignee') && (
								<>
									<input
										hidden
										name="assignee"
										value={assignee?.id ?? ''}
										onChange={() => setAssignee(() => null)}
									/>
									<UserSearchInput
										setUser={setAssignee}
										user={assignee}
										label="Assigned to"
										id="user-selector"
									/>
								</>
							)}
						</Grid>
					</Grid>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '1rem',
							paddingY: '16px',
						}}
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
				<Grid container spacing={2}>
					<Grid item xs={8}>
						<UserComments comments={comments} commentAdded={handleAddComment} />
					</Grid>
				</Grid>
			</Box>
		</FullHeightSection>
	);
};
