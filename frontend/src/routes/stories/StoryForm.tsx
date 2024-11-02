import {
	FormControl,
	TextField,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Button,
	Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import SprintSearchInput from '../sprints/SprintSearchInput';
import UserSearchInput from '../sprints/UserSearchInput';
import EpicSearchInput from './EpicSearchInput';
import {
	statuses,
	priorities,
	ticketTypes,
	StoryFormProps,
} from './stories.model';
import { useState } from 'react';
import { useForm, useController, SubmitHandler } from 'react-hook-form';
import { Sprint } from '../../api/sprints';
import { User } from '../../api/users';
import { Epic } from '../epics/Epics';
import { CreateStoryPayload } from '../../api/stories';

const StoryForm = ({
	onConfirm,
	confirmButton,
	cancelButton,
}: {
	onConfirm: (formData?: Omit<CreateStoryPayload, 'item_type'>) => void;
	confirmButton?: string;
	cancelButton?: string;
}) => {
	const { register, handleSubmit, control } = useForm<StoryFormProps>();
	// we cannot use register('targetDate') in the mui datepicker
	// due the type mismatching
	const targetDateField = useController({ control, name: 'targetDate' });

	const [sprint, setSprint] = useState<Sprint | null>(null);
	const [assignedTo, setAssignedTo] = useState<User | null>(null);
	const [epic, setEpic] = useState<Epic | null>(null);

	const onSubmit: SubmitHandler<StoryFormProps> = async (
		data: StoryFormProps
	) => {
		const estimated_completion_date = data.targetDate
			? data.targetDate.toISOString()
			: undefined;
		const story = {
			title: data.title,
			description: data.description,
			iteration_id: sprint?.id,
			priority: data.priority,
			estimate: data.estimate ? +data.estimate : undefined,
			estimated_completion_date,
			status: data.status,
			item_sub_type: data.subType,
			assigned_to_id: assignedTo?.id,
			epicId: epic?.id,
		};
		onConfirm(story);
	};

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
				style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
			>
				<div className="flex flex-col gap-2">
					{/* THIS IS WHERE WE ADD ALL OF OUR FIELDS */}
					<Typography
						variant="body1"
						className="!font-semibold text-neutral-regular underline"
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
						className="!font-semibold text-neutral-regular underline pt-8"
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
							defaultValue={undefined}
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
							defaultValue={undefined}
						>
							{priorities.map((priority) => (
								<MenuItem value={priority.value} key={priority.value ?? 'none'}>
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
							defaultValue={undefined}
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
				</div>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '1rem',
						alignItems: 'center',
						paddingTop: '16px',
					}}
				>
					<Button
						variant="contained"
						sx={{ backgroundColor: 'neutral.lightest', color: 'black' }}
						color="neutral"
						onClick={() => onConfirm()}
					>
						{cancelButton}
					</Button>
					<Button
						variant="contained"
						sx={{ padding: '6px 48px' }}
						type="submit"
					>
						{confirmButton}
					</Button>
				</Box>
			</form>
		</>
	);
};

export default StoryForm;
