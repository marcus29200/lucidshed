import {
	Typography,
	TextField,
	Grid,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from '@mui/material';
import {
	Link,
	LoaderFunctionArgs,
	useLoaderData,
	useParams,
} from 'react-router-dom';

import { QueryClient, queryOptions, useMutation } from '@tanstack/react-query';
import {
	CreateEpicPayload,
	getEpic,
	patchEpic,
	Priority,
} from '../../api/epics';
import { HomeIcon } from '../../icons/icons';
import { RotateRight, Settings } from '@mui/icons-material';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import EpicStories from './EpicStories';
import { Epic } from './Epics';
import { useState } from 'react';
import { StoriesProgress } from '../../shared/stories.mapper';
import { queryClient } from '../../router';
import { DatePicker } from '@mui/x-date-pickers';
import { priorities } from '../stories/stories.model';

export const epicDetailQuery = (orgId: string, epicId: number) =>
	queryOptions({
		queryKey: ['epics', 'detail', orgId, epicId],
		queryFn: async () => getEpic({ orgId, epicId }),
	});

export const epicLoader = (_queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No org id provided');
		}
		if (!params.epicId) {
			throw new Error('No epic id provided');
		}
		return getEpic({ orgId: params.orgId, epicId: +params.epicId });
		// return queryClient.ensureQueryData(
		// 	epicDetailQuery(params.orgId, +params.epicId)
		// );
	};
};
let debounceTimeId;
export const EpicDetails = () => {
	const orgId = useParams().orgId as string;
	const initial = useLoaderData() as Epic;

	const [epic, setEpic] = useState<Epic>(initial);
	const [progress, setProgress] = useState<StoriesProgress>({
		progress: 0,
		completed: 0,
		total: 0,
	});
	const [isLoading, setIsLoading] = useState(false);

	const { mutate: updateEpic } = useMutation({
		mutationFn: patchEpic,
		onError: () => {
			console.error('wuhh');
			setIsLoading(false);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['epics', 'detail', orgId, initial.id],
			});
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		},
	});

	const handleSetProgress = (storiesProgress: StoriesProgress) => {
		setProgress(storiesProgress);
	};

	const handlePatchEpic = (data: Partial<CreateEpicPayload>) => {
		if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
		debounceTimeId = setTimeout(() => {
			updateEpic({
				orgId: orgId,
				epicId: epic.id,
				data,
			});
			setIsLoading(true);
		}, 500);
	};
	const handleEditTitle = (value: string): void => {
		setEpic((prev) => ({ ...prev, name: value }));
		if (value) {
			handlePatchEpic({ title: value });
		} else if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
	};

	const handleEditDescription = (value: string): void => {
		setEpic((prev) => ({ ...prev, description: value }));
		handlePatchEpic({ description: value });
	};

	const handleEditDate = (value: Date | null): void => {
		if (!value) {
			return;
		}
		const newDate = value.toISOString();
		setEpic((prev) => ({ ...prev, endDate: newDate }));
		handlePatchEpic({ estimated_completion_date: newDate });
	};

	const handleEditPriority = (value: Priority): void => {
		setEpic((prev) => ({ ...prev, priority: value }));
		handlePatchEpic({ priority: value });
	};

	return (
		<>
			<div className="flex space-x-4 pb-4">
				<Link to={`/${orgId}/epics/${epic.id}`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 transition bg-green-500 border-none text-white rounded-md font-bold hover:border-none hover:bg-green-600/80 relative">
						<HomeIcon className="text-white -ml-3" />
						<span className="mt-1">Stories</span>
						<div className="absolute -bottom-1 rounded h-0.5 w-full bg-green-500"></div>
					</button>
				</Link>
				<Link to={`/${orgId}/epics/${epic.id}/dashboard`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-50 text-gray-300 rounded-md font-bold border-none hover:border-none shadow-neutral">
						<Settings className="text-gray-300 -ml-3" />
						Reporting
					</button>
				</Link>
			</div>
			<div className="rounded-xl bg-white">
				<Grid
					container
					sx={{
						padding: '16px',
						borderRadius: '16px',
						alignItems: 'center',
						gap: '8px',
					}}
				>
					<Grid item xs={6}>
						<TextField
							variant="outlined"
							size="small"
							margin="dense"
							fullWidth
							label="Name"
							id="name"
							name="name"
							value={epic.name}
							onChange={(e) => handleEditTitle(e.target.value)}
						></TextField>
					</Grid>
					<Grid item xs={2} sx={{ textAlign: 'left' }}>
						<RotateRight
							className="duration-500 text-neutral-regular transition-all animate-spin"
							style={{
								opacity: isLoading ? 1 : 0,
							}}
						/>
					</Grid>
				</Grid>
				<Grid container sx={{ padding: '16px', borderRadius: '16px' }}>
					<Grid item xs={6}>
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
							value={epic.description}
							onChange={(e) => handleEditDescription(e.target.value)}
						></TextField>
					</Grid>
					<Grid item xs={6}>
						<div className="flex px-6">
							<div className="w-1/2 flex flex-col gap-4">
								<div className="flex justify-between">
									{/* Estimated Completion */}
									<div className="pt-2">
										<div className="flex items-center space-x-2">
											<DatePicker
												label="Estimated Completion"
												name="targetDate"
												value={
													epic.endDate ? new Date(epic.endDate) : undefined
												}
												onChange={handleEditDate}
												slotProps={{
													textField: {
														variant: 'outlined',
														size: 'medium',
														fullWidth: true,
													},
												}}
											></DatePicker>
										</div>
									</div>

									{/* Progress Indicator */}
								</div>

								{/* Priority/Ranking */}
								<div className="flex w-full">
									<FormControl fullWidth>
										<InputLabel size="normal" id="priority-label">
											Priority
										</InputLabel>
										<Select
											variant="outlined"
											size="medium"
											margin="dense"
											labelId="priority-label"
											label="Priority"
											value={epic.priority}
											onChange={(evt) =>
												handleEditPriority(evt.target.value as Priority)
											}
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
								</div>

								{/* Product Area/Category */}
								<div className="mb-4">
									<p className="text-gray-500 text-left">
										Product Area/Category
									</p>
									<p className="text-lg text-left">-</p>
								</div>

								{/* Attachments/Files */}
								<div className="mb-4">
									<p className="text-gray-500 text-left">Attachments/Files</p>
									<div className="flex flex-wrap gap-2 mt-2">-</div>
								</div>
							</div>
							<div className="flex items-center flex-col gap-4 w-1/2">
								<Typography variant="h4" align="left">
									Progress
								</Typography>

								<CircularProgressbar
									className="!w-48"
									value={progress.progress}
									text={`${progress.progress.toFixed(2)}% `}
									styles={buildStyles({
										// Rotation of path and trail, in number of turns (0-1)
										rotation: 0.25,

										// Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
										strokeLinecap: 'round',

										// Text size
										textSize: '16px',

										// How long animation takes to go from one percentage to another, in seconds
										pathTransitionDuration: 0.5,

										// Can specify path transition in more detail, or remove it entirely
										// pathTransition: 'none',

										// Colors
										pathColor: `#22C55E`,
										textColor: '#000000',

										backgroundColor: '#ccc',
									})}
								/>
								<p className="text-gray-500 text-left mt-2">
									{progress.completed}/{progress.total} Stories Completed
								</p>
							</div>
						</div>
					</Grid>
				</Grid>
			</div>

			<br />
			<EpicStories epic={epic} setProgress={handleSetProgress} />
		</>
	);
};
