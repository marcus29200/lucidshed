import {
	Grid,
	FormControl,
	TextField,
	Box,
	Button,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { memo, useState } from 'react';
import { useForm, useController, SubmitHandler } from 'react-hook-form';
import { User } from '../../api/users';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';
import UserSearchInput from '../sprints/UserSearchInput';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { createFeatureRequest } from '../../api/featureRequests';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeatureLists } from '../../api/featureLists';
import { FeatureListFormProps } from '../featureLists/FeatureList';

type FeatureRequestFormProps = {
	title: string;
	description?: string;
	requester?: string;
	assignedTo?: string;
	tags?: string;
};

const CreateFeatureRequest = memo(({ show }: { show: boolean }) => {
	const orgId = useParams().orgId as string;

	const { register, reset, handleSubmit, control } =
		useForm<FeatureRequestFormProps>();

	const descriptionField = useController({
		control,
		name: 'description',
		defaultValue: '',
	});

	const [requester, setRequester] = useState<User | null>(null);
	const [featureId, setFeatureId] = useState<string>('');

	const today = dayjs().format('MMM D, YYYY');
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: features } = useQuery({
		queryKey: ['featureLists'],
		queryFn: async () => getFeatureLists(orgId),
	});
	const featuresList: FeatureListFormProps[] = features ?? [];

	const onSubmit: SubmitHandler<FeatureRequestFormProps> = async (
		data: FeatureRequestFormProps
	) => {
		const payload = {
			title: data.title,
			description: data.description || '',
			submitted_by_id: requester?.id || null,
			feature_assigned: featureId?.toString(),
			comments: [],
		};
		try {
			await createFeatureRequest({ orgId, data: payload });
			queryClient.invalidateQueries({ queryKey: ['companies'] });
		} catch (error) {
			console.error('Error creating feature request:', error);
		} finally {
			cancelCreation();
		}
	};

	const cancelCreation = () => {
		reset();
		descriptionField.field.value = '';
		setRequester(() => null);
		navigate(`/${orgId}/feature-requests`);
	};
	return (
		<div
			className={`absolute max-w-2xl h-[calc(100vh_-_170px)] z-50 -top-3 right-0 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
				show
					? 'translate-x-0'
					: 'translate-x-[800px] opacity-0 pointer-events-none'
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
					<Grid item xs={6}>
						<FormControl fullWidth sx={{ marginTop: '8px' }}>
							<InputLabel size="small" id="assigned-feature-label">
								Assigned Feature
							</InputLabel>
							<Select
								variant="outlined"
								size="small"
								fullWidth
								labelId="assigned-feature-label"
								label="Assigned Feature"
								value={featureId}
								onChange={(evt) => {
									setFeatureId(() => evt.target.value);
								}}
								id="assigned-feature"
								name="assigned-feature"
							>
								{featuresList.map((feature) => (
									<MenuItem value={feature.id} key={feature.id}>
										{feature.title}
									</MenuItem>
								))}
							</Select>
						</FormControl>
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
							cancelCreation();
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
