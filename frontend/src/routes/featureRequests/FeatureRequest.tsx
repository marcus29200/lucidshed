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
import { memo, useContext, useEffect, useState } from 'react';

import { User } from '../../api/users';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';
import UserSearchInput from '../sprints/UserSearchInput';

import { useNavigate, useParams } from 'react-router-dom';
import { UsersContext } from '../../hooks/users';
import { updateFeatureRequest } from '../../api/featureRequests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateRight } from '@mui/icons-material';
import { getFeatureLists } from '../../api/featureLists';
import { FeatureListFormProps } from '../featureLists/FeatureList';

export type FeatureRequestFormProps = {
	title: string;
	id: number;
	submittedDate: string;
	description: string | null;
	requester: string | null;
	assignedTo: string | null;
	tags: string | null;
	submittedBy: string | null;
	featureAssigned: string | null;
	featureAssignedName: string | null;
};
let debounceTimeId;
const FeatureRequest = memo(
	({
		show,
		featureRequest,
	}: {
		show: boolean;
		featureRequest: FeatureRequestFormProps | null;
	}) => {
		const orgId = useParams().orgId as string;

		const users = useContext(UsersContext);

		const [title, setTitle] = useState<string>('');
		const [description, setDescription] = useState<string>('');
		const [tags, setTags] = useState<string>('');
		const [requester, setRequester] = useState<User | null>(null);
		const [isLoading, setIsLoading] = useState(false);
		const [submitDate, setSubmitDate] = useState<string>('');

		const [featureId, setFeatureId] = useState<string | null>('');

		const navigate = useNavigate();
		const queryClient = useQueryClient();

		const { data: features } = useQuery({
			queryKey: ['featureLists'],
			queryFn: async () => getFeatureLists(orgId),
		});
		const featuresList: FeatureListFormProps[] = features ?? [];

		const { mutate: patchFeatureRequest } = useMutation({
			mutationFn: updateFeatureRequest,
			onError: () => {
				console.error('wuhh');
				setIsLoading(false);
			},
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: ['feature-requests', orgId],
				});
				queryClient.invalidateQueries({ queryKey: ['companies'] });
				cancelEdition();
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			},
		});

		useEffect(() => {
			if (featureRequest) {
				setTitle(() => featureRequest.title);
				setDescription(() => featureRequest.description ?? '');
				setTags(() => featureRequest.tags ?? '');
				setSubmitDate(() => featureRequest.submittedDate);
				setRequester(
					() =>
						users.find((user) => user.id === featureRequest.requester) || null
				);
				setFeatureId(featureRequest.featureAssigned);
			} else {
				clearValues();
			}
		}, [featureRequest, users]);

		const cancelEdition = () => {
			clearValues();
			navigate(`/${orgId}/feature-requests`);
		};

		const clearValues = () => {
			setTitle(() => '');
			setDescription(() => '');
			setTags(() => '');
			setRequester(() => null);
			setFeatureId(() => '');
		};

		const handlePatchFeatureRequest = (data) => {
			if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
			setIsLoading(true);
			debounceTimeId = setTimeout(() => {
				patchFeatureRequest({
					orgId,
					requestId: (featureRequest as FeatureRequestFormProps).id,
					data,
				});
				setIsLoading(true);
			}, 400);
		};

		const handleEditTitle = (value: string) => {
			setTitle(value);
			if (value) {
				// handlePatchFeatureRequest({ title: value });
			} else if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
		};

		const handleEditDescription = (value: string) => {
			setDescription(value);
			// handlePatchFeatureRequest({ description: value });
		};

		const handleEditRequester = (user: User | null) => {
			setRequester(user);
			// handlePatchFeatureRequest({ submitted_by_id: user?.id || null });
		};

		const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const payload = {
				description,
				tags,
				submitted_by_id: requester?.id || null,
				title: featureRequest?.title,
				feature_assigned: featureId?.toString(),
			};
			if (title && title !== featureRequest?.title) {
				payload.title = title;
			}

			handlePatchFeatureRequest(payload);
		};

		return (
			<div
				className={`absolute max-w-2xl h-[calc(100vh_-_170px)] z-50 -top-3 right-0 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
					show
						? 'translate-x-0'
						: 'translate-x-[800px] opacity-0 pointer-events-none'
				}`}
			>
				<form
					onSubmit={(e) => handleSubmit(e)}
					className="h-full flex flex-col"
				>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<div className="flex gap-4 justify-between">
								<FormControl
									sx={{
										width: '50%',
										display: 'flex',
										gap: '4px',
										alignItems: 'center',
										flexDirection: 'row',
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
										value={title}
										onChange={(v) => handleEditTitle(v.currentTarget.value)}
									></TextField>
									<RotateRight
										className="duration-500 text-neutral-regular transition-all animate-spin"
										style={{
											opacity: isLoading ? 1 : 0,
										}}
									/>
								</FormControl>
								<span className="text-neutral-regular text-xs">
									{submitDate}
								</span>
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
									setUser={handleEditRequester}
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
										<MenuItem value={feature.id.toString()} key={feature.id}>
											{feature.title}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12}>
							<DescriptionRichEditor
								onChange={handleEditDescription}
								value={description}
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
								cancelEdition();
							}}
						>
							Close
						</Button>
						<Button variant="contained" type="submit" disabled={isLoading}>
							Save changes
						</Button>
					</Box>
				</form>
			</div>
		);
	}
);

FeatureRequest.displayName = 'EditFeatureRequest';

export default FeatureRequest;
