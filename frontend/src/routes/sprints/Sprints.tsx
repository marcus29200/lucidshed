import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
	Link,
	LoaderFunctionArgs,
	useLoaderData,
	useParams,
} from 'react-router-dom';
import { getSprints, getStoriesForSprint, Sprint } from '../../api/sprints';
import {
	Box,
	Grid,
	LinearProgress,
	TextField,
	Typography,
} from '@mui/material';
import SprintStoryTable from './SprintStoryTable';
import { useEffect, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Settings } from '@mui/icons-material';
import { HomeIcon } from '../../icons/icons';
import SprintSearchInput from './SprintSearchInput';
import { Story } from '../stories/Stories';
import { getStoriesProgress } from '../../shared/stories.mapper';
import { updateStory } from '../../api/stories';
import BacklogStoriesTable from './BacklogStories';

export const getSprintsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['sprints'],
		queryFn: async () => getSprints(orgId),
	});

export const loader = (_queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('no org id');
		}
		// something is fucked up with the queryKey...
		return getSprints(params.orgId);
		// return queryClient.ensureQueryData(getSprintsQuery(params.orgId))
	};
};

export const Sprints = () => {
	const sprints = useLoaderData() as Sprint[];
	const orgId = useParams().orgId as string;
	const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(
		sprints[0]
	);
	const [sprintProgress, setSprintProgress] = useState<number>(0);
	const [currentStories, setCurrentStories] = useState<Story[]>([]);
	const [removedStory, setRemovedStory] = useState<Story | undefined>();
	const [addedStory, setAddedStory] = useState<Story | undefined>();
	useMemo(() => {
		if (selectedSprint) {
			getStoriesForSprint({ orgId, sprintId: selectedSprint.id }).then(
				(stories) => {
					setCurrentStories(() => stories);
				}
			);
		}
	}, [selectedSprint]);

	useEffect(() => {
		setSprintProgress(getStoriesProgress(currentStories).progress);
	}, [currentStories]);

	useEffect(() => {
		if (addedStory) {
			setCurrentStories((stories) => stories.concat([addedStory]));
		}
		setSprintProgress(getStoriesProgress(currentStories).progress);
	}, [addedStory]);

	const onRemoveStory = (storyId: number) => {
		updateStory({ orgId, storyId, data: { iteration_id: null } }).then(() => {
			setCurrentStories((stories) =>
				stories.filter((story) => story.storyId !== storyId)
			);
			setRemovedStory(
				currentStories.find((story) => story.storyId === storyId)
			);
		});
	};

	if (!sprints.length) {
		return (
			<>
				<div className="flex justify-end">
					<SprintSearchInput enableAddNew={true} sprint={null} />
				</div>
				<div className="rounded-xl flex items-center justify-center mt-8 bg-white h-80">
					<p className="text-base text-neutral-regular">
						There are currently no existing Sprints, Start <br /> creating a
						sprint from the drop down or menu.
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="flex gap-x-4 pb-4 w-full">
				<Link to={`/${orgId}/sprints`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 transition bg-green-500 border-none text-white rounded-md font-bold hover:border-none hover:bg-green-600/80 relative">
						<HomeIcon className="text-white -ml-3" />
						<span className="mt-1">Stories</span>
						<div className="absolute -bottom-1 rounded h-0.5 w-full bg-green-500"></div>
					</button>
				</Link>
				<Link to={`/${orgId}/sprints/dashboard`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-50 text-gray-300 rounded-md font-bold border-none hover:border-none shadow-neutral">
						<Settings className="text-gray-300 -ml-3" />
						Reporting
					</button>
				</Link>
				<div className="ml-auto flex-1">
					<SprintSearchInput
						enableAddNew={true}
						sprint={selectedSprint}
						setSprint={(sprint) => setSelectedSprint(sprint)}
					/>
				</div>
			</div>
			<Box
				sx={{
					background: 'white',
					padding: '16px',
					borderRadius: '12px',
				}}
			>
				{selectedSprint && (
					<>
						<Typography
							variant="h6"
							fontSize={16}
							fontWeight={700}
							align="left"
						>
							{selectedSprint.title}
						</Typography>
						<div
							style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
						>
							<Grid container spacing={2} sx={{ flexGrow: 1 }}>
								<Grid item xs={8}>
									<TextField
										sx={{
											'& .MuiInputBase-root': {
												background: 'white',
											},
										}}
										variant="outlined"
										size="small"
										margin="dense"
										fullWidth
										label="Description"
										id="description"
										name="description"
										multiline
										value={selectedSprint.description}
										rows={8}
									></TextField>
								</Grid>
								<Grid item xs={4}>
									<DatePicker
										label="Sprint Start date"
										name="startDate"
										slotProps={{
											textField: {
												variant: 'outlined',
												size: 'small',
												margin: 'dense',
												fullWidth: true,
												sx: {
													'& .MuiInputBase-root': {
														background: 'white',
													},
												},
											},
										}}
										value={new Date(selectedSprint.startDate)}
									></DatePicker>
									<DatePicker
										label="Sprint End date"
										name="endDate"
										slotProps={{
											textField: {
												variant: 'outlined',
												size: 'small',
												margin: 'dense',
												fullWidth: true,
												sx: {
													'& .MuiInputBase-root': {
														background: 'white',
													},
												},
											},
										}}
										value={new Date(selectedSprint.endDate)}
									></DatePicker>
								</Grid>
							</Grid>
						</div>
					</>
				)}

				{/* Progress Bar */}
				<div className="w-full text-left pb-8">
					<div className="py-2">
						<label className="text-xs text-neutral-regular block">
							Sprint Status
						</label>
						<div className="text-base font-semibold">
							{sprintProgress.toFixed(2)}% to complete
						</div>
					</div>
					<LinearProgress
						sx={{
							'&.MuiLinearProgress-root': {
								background: '#d1d5db',
								height: '12px',
								borderRadius: '90px',
							},
						}}
						variant="determinate"
						value={sprintProgress}
					/>
				</div>
			</Box>
			{/* stories table */}
			<div className="rounded-xl p-4 bg-white mt-4">
				<SprintStoryTable
					stories={currentStories}
					handleRemoveStory={onRemoveStory}
				/>
			</div>

			{/* backlog table */}
			<div className="rounded-xl p-4 bg-white mt-4">
				<Typography
					variant="h5"
					textAlign="left"
					padding="10px 0"
					fontWeight="semibold"
				>
					Backlog
				</Typography>
				<BacklogStoriesTable
					removedStory={removedStory}
					selectedSprint={selectedSprint as Sprint}
					setAddedStory={setAddedStory}
				/>
			</div>
		</>
	);
};
