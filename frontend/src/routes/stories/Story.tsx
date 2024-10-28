import { Form, useLoaderData, useNavigate } from 'react-router-dom';
import FullHeightSection from '../../components/FullHeightSection';
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, useMemo, useState } from 'react';
import {
	DISABLED_DEFAULT_FIELDS,
	METADATA_FIELD_OPTIONS,
	MetadataFieldOption,
	priorities,
	statuses,
	ticketTypes,
} from './stories.model';
import {
	CreateStoryPayload,
	getRelatedEpic,
	StoryAPI,
	updateStory,
} from '../../api/stories';
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
import { ArrowBack, RotateRight } from '@mui/icons-material';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import EpicSearchInput from './EpicSearchInput';
import { Epic } from '../epics/Epics';
import { linkStoryToEpic, removeLinkStoryToEpic } from '../../api/epics';

let debounceTimeId;

export const Story = () => {
	const story = useLoaderData() as StoryAPI;
	const navigate = useNavigate();
	const [title, setTitle] = useState(story.title ?? '');
	const [description, setDescription] = useState(story.description ?? '');
	const [comments, setComments] = useState<UserComment[]>([]);
	const [sprint, setSprint] = useState<Sprint | null>(
		mapPayloadToSprint(story.iteration) ?? null
	);
	const [epic, setEpic] = useState<Epic | null>(null);

	const [assignedTo, setAssignedTo] = useState<User | null>(
		mapUser(story.assigned_to) ?? null
	);
	const [isLoading, setIsLoading] = useState(false);
	const [originalEpic, setOriginalEpic] = useState<Epic | null>(null);

	useEffect(() => {
		getAllComments({ orgId: story.organization_id, workItemId: story.id }).then(
			(comments) => {
				setComments(comments);
			}
		);
		getRelatedEpic(story.organization_id, story.id).then((relatedEpic) => {
			setEpic(relatedEpic);
			setOriginalEpic(relatedEpic);
		});
	}, [story]);

	const [dynamicFields, setDynamicFields] = useState({
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

	useMemo(() => {
		const fieldsWithValues = Object.keys(dynamicFields).filter(
			(field) => !!dynamicFields[field as MetadataFieldOption]
		);
		if (sprint) {
			fieldsWithValues.push('sprint');
		}
		if (assignedTo) {
			fieldsWithValues.push('assignedTo');
		}
		if (epic) {
			fieldsWithValues.push('epic');
		}
		setSelectedFields(fieldsWithValues as MetadataFieldOption[]);
	}, [dynamicFields, sprint, assignedTo, epic]);

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
	const queryClient = useQueryClient();
	const { mutate: patchStory } = useMutation({
		mutationFn: updateStory,
		onError: () => {
			console.error('wuhh');
			setIsLoading(false);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['stories'] });
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		},
	});

	const handlePatchStory = (data: Partial<CreateStoryPayload>) => {
		if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
		debounceTimeId = setTimeout(() => {
			patchStory({
				orgId: story.organization_id,
				storyId: story.id,
				data,
			});
			setIsLoading(true);
		}, 400);
	};

	const handleEditTitle = (value: string): void => {
		setTitle(value);
		if (value && value.length < 41) {
			handlePatchStory({ title: value });
		} else if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
	};

	const handleEditDescription = (value: string): void => {
		setDescription(value);
		handlePatchStory({ description: value });
	};

	const handleEditSprint = (value: Sprint): void => {
		setSprint(value);
		handlePatchStory({ iteration_id: value.id });
	};

	const handleEditAssignedTo = (value: User): void => {
		setAssignedTo(value);
		handlePatchStory({ assigned_to_id: value.id });
	};

	const handleEditEpic = async (value: Epic | null) => {
		setEpic(value);

		if (!originalEpic && value) {
			setIsLoading(true);
			// assign epic to story using the /links endpoint
			await linkStoryToEpic({
				orgId: story.organization_id,
				storyId: story.id,
				epicId: value.epicId,
			});
			setOriginalEpic(value);
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
			return;
		}
		if (originalEpic && !value) {
			setIsLoading(true);
			// assign epic to story using the /links endpoint
			try {
				await removeLinkStoryToEpic({
					orgId: story.organization_id,
					storyId: story.id,
					epicId: originalEpic.epicId,
				});
			} catch (error) {
				console.warn(error);
			}
			setOriginalEpic(null);
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
			return;
		}
	};

	const handleEditDynamicField = (field: string, value): void => {
		setDynamicFields({
			...dynamicFields,
			[field]: value,
		});
		if (field === 'subType') {
			field = 'item_sub_type';
		}
		if (field === 'assignedTo') {
			field = 'assigned_to_id';
		}
		if (field === 'targetDate') {
			value = new Date(value as string).toISOString();
			field = 'estimated_completion_date';
		}

		handlePatchStory({ [field]: value });
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
						<div className="flex gap-4 items-center">
							<IconButton onClick={() => navigate('..', { relative: 'path' })}>
								<ArrowBack className="!h-8 !w-8 text-neutral-dak" />
							</IconButton>

							<Typography variant="body1" align="left">
								Basic Details
							</Typography>

							<RotateRight
								className="duration-500 text-neutral-regular transition-all animate-spin"
								style={{
									opacity: isLoading ? 1 : 0,
								}}
							/>
						</div>
					</Grid>
					<Grid item xs={4}>
						<Button variant="contained" color="success" onClick={() => {}}>
							Ticket Metadata
						</Button>
					</Grid>
				</Grid>

				<Form
					onSubmit={(e) => e.preventDefault()}
					style={{
						display: 'flex',
						flexDirection: 'column',
						flexGrow: 1,
						paddingBottom: '20px',
					}}
				>
					<Grid container spacing={2} sx={{ flexGrow: 1 }}>
						<Grid item xs={8}>
							<FormControl fullWidth>
								<TextField
									variant="outlined"
									size="small"
									required
									margin="dense"
									fullWidth
									label="Title"
									id="title"
									name="title"
									color={title.length > 40 ? 'error' : 'primary'}
									value={title}
									onChange={(e) => handleEditTitle(e.target.value)}
								></TextField>
								{title.length > 40 && (
									<small role="alert" className="text-left pb-2 text-red-500">
										Ticket title must be maximum 40 characters.
									</small>
								)}
							</FormControl>
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
								onChange={(e) => handleEditDescription(e.target.value)}
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
											disabled={DISABLED_DEFAULT_FIELDS.includes(
												field as MetadataFieldOption
											)}
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
									onChange={(e) => handleEditDynamicField('targetDate', e)}
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
										handleEditDynamicField('estimate', +e.target.value)
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
											handleEditDynamicField('status', e.target.value)
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
											handleEditDynamicField('priority', e.target.value)
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
											handleEditDynamicField('subType', e.target.value)
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
									<SprintSearchInput
										setSprint={(sprint) => {
											handleEditSprint(sprint);
										}}
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
							{selectedFields.includes('assignedTo') && (
								<>
									<UserSearchInput
										setUser={(user) => handleEditAssignedTo(user)}
										user={assignedTo}
										label="Assigned to"
										id="user-selector"
									/>
								</>
							)}
							{selectedFields.includes('epic') && (
								<>
									<EpicSearchInput
										epic={epic}
										setEpic={handleEditEpic}
										id="epic-selector"
										label="Epic"
									/>
								</>
							)}
						</Grid>
					</Grid>
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
