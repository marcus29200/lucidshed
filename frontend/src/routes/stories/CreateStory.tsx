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
import { Form, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import SprintSearchInput from '../sprints/SprintSearchInput';
import { Sprint } from '../../api/sprints';
import {
	MetadataFieldOption,
	METADATA_FIELD_OPTIONS,
	statuses,
	priorities,
	ticketTypes,
} from './stories.model';
import { User } from '../../api/users';
import UserSearchInput from '../sprints/UserSearchInput';

export const CreateStory = () => {
	const navigate = useNavigate();
	const [sprint, setSprint] = useState<Sprint | null>(null);
	const [assignee, setAssignee] = useState<User | null>(null);

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
										id="assignee-selector"
										label="Assigned to"
									/>
								</>
							)}
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
