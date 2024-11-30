import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { memo, useContext, useEffect, useState } from 'react';

import { User } from '../../api/users';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';
import UserSearchInput from '../sprints/UserSearchInput';

import { useNavigate, useParams } from 'react-router-dom';
import { UsersContext } from '../../hooks/users';
import { updateFeatureRequest } from '../../api/featureRequests';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateRight } from '@mui/icons-material';

export type FeatureRequestFormProps = {
	title: string;
	id: number;
	submittedDate: string;
	description: string | null;
	requester: string | null;
	assignedTo: string | null;
	tags: string | null;
	submittedBy: string | null;
	assignedToName: string | null;
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
		const [assignedTo, setAssignedTo] = useState<User | null>(null);
		const [isLoading, setIsLoading] = useState(false);
		const [submitDate, setSubmitDate] = useState<string>('');

		const navigate = useNavigate();
		const queryClient = useQueryClient();

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
				setAssignedTo(
					() =>
						users.find((user) => user.id === featureRequest.assignedTo) || null
				);
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
			setAssignedTo(() => null);
		};

		const handlePatchFeatureRequest = (data) => {
			if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
			debounceTimeId = setTimeout(() => {
				const fieldToUpdate = Object.keys(data)[0];
				if (data[fieldToUpdate] === undefined) {
					// change undefined by null
					// null clears the value in the database
					data[fieldToUpdate] = null;
				}
				if (data.status === 'in-progress') {
					data.start_date = new Date().toISOString();
					data.completed_at = null;
				}
				if (data.status === 'done') {
					data.completed_at = new Date().toISOString();
				}
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
				handlePatchFeatureRequest({ title: value });
			} else if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
		};

		const handleEditDescription = (value: string) => {
			setDescription(value);
			handlePatchFeatureRequest({ description: value });
		};

		const handleEditTags = (value: string) => {
			setTags(value);
		};

		const handleEditRequester = (user: User | null) => {
			setRequester(user);
			handlePatchFeatureRequest({ submitted_by_id: user?.id || null });
		};
		const handleEditAssignedTo = (user: User | null) => {
			setAssignedTo(user);
			handlePatchFeatureRequest({ assigned_to_id: user?.id || null });
		};

		return (
			<div
				className={`absolute max-w-2xl h-[calc(100vh_-_90px)] z-50 -top-3 -right-3 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
					show ? 'translate-x-0' : 'translate-x-[800px]'
				}`}
			>
				<form
					onSubmit={(e) => e.preventDefault()}
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
								value={tags}
								onChange={(v) => handleEditTags(v.currentTarget.value)}
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
									setUser={handleEditAssignedTo}
									user={assignedTo}
									id="assignedTo-selector"
									label="Assigned to"
								/>
							</>
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
					</Box>
				</form>
			</div>
		);
	}
);

FeatureRequest.displayName = 'EditFeatureRequest';

export default FeatureRequest;
