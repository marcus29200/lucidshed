import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import { useForm, useController, SubmitHandler } from 'react-hook-form';
import { User } from '../../api/users';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';
import UserSearchInput from '../sprints/UserSearchInput';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

type FeatureRequestFormProps = {
	title: string;
	description?: string;
	requester?: string;
	assignedTo?: string;
	tags?: string;
};

const CreateFeatureRequest = memo(({ show }: { show: boolean }) => {
	const orgId = useParams().orgId as string;

	const { register, handleSubmit, control } =
		useForm<FeatureRequestFormProps>();

	const descriptionField = useController({ control, name: 'description' });

	const [requester, setRequester] = useState<User | null>(null);
	const [assignedTo, setAssignedTo] = useState<User | null>(null);

	const today = dayjs().format('MMM D, YYYY');
	const navigate = useNavigate();

	const onSubmit: SubmitHandler<FeatureRequestFormProps> = async (
		data: FeatureRequestFormProps
	) => {
		console.log(data);
	};
	return (
		<div
			className={`absolute max-w-2xl h-[calc(100vh_-_90px)] z-50 -top-3 -right-3 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
				show ? 'translate-x-0' : 'translate-x-[800px]'
			}`}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<div className="flex gap-4 justify-between">
							<FormControl
								sx={{
									width: '50%',
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
							<span className="text-neutral-regular text-xs">{today}</span>
						</div>
					</Grid>
					<Grid item xs={6}>
						<>
							<input
								hidden
								name="requester"
								value={requester?.id ?? ''}
								onChange={() => setRequester(() => null)}
							/>
							<UserSearchInput
								setUser={setRequester}
								user={requester}
								id="requester-selector"
								label="Requester"
							/>
						</>
					</Grid>
					<Grid item xs={6}></Grid>

					<Grid
						item
						xs={6}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: '8px',
						}}
					>
						<TextField
							variant="outlined"
							size="small"
							margin="dense"
							fullWidth
							label="Tags"
							id="tags"
							{...register('tags')}
						></TextField>
					</Grid>
					<Grid
						item
						xs={6}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: '8px',
						}}
					>
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
					</Grid>
					<Grid item xs={12}>
						<DescriptionRichEditor
							onChange={descriptionField.field.onChange}
							value={descriptionField.field.value}
						/>
					</Grid>
				</Grid>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '1rem',
						marginTop: 'auto',
					}}
				>
					<Button
						variant="contained"
						sx={{ backgroundColor: 'neutral.lightest', color: 'black' }}
						color="neutral"
						onClick={() => {
							navigate(`/${orgId}/feature-requests`);
						}}
					>
						Cancel
					</Button>
					<Button variant="contained" type="submit">
						Create Request
					</Button>
				</Box>
			</form>
		</div>
	);
});

CreateFeatureRequest.displayName = 'CreateFeatureRequest';

export default CreateFeatureRequest;
