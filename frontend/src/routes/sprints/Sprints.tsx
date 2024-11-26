import { QueryClient, queryOptions, useMutation } from '@tanstack/react-query';
import {
	Link,
	LoaderFunctionArgs,
	useLoaderData,
	useParams,
} from 'react-router-dom';
import {
	CreateSprintPayload,
	deleteSprint,
	getSprints,
	patchSprint,
	Sprint,
} from '../../api/sprints';
import {
	Box,
	Button,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	tooltipClasses,
} from '@mui/material';
import SprintStoryTable from './SprintStoryTable';
import { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Delete, ExpandMore, RotateRight, Settings } from '@mui/icons-material';
import { HomeIcon } from '../../icons/icons';
import SprintSearchInput from './SprintSearchInput';
import { queryClient } from '../../router';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';

export const getSprintsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['sprints'],
		queryFn: async () => getSprints(orgId),
	});

export const sprintsLoader = (_queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('no org id');
		}
		// something is fucked up with the queryKey...
		return getSprints(params.orgId);
		// return queryClient.ensureQueryData(getSprintsQuery(params.orgId))
	};
};

const SELECTED_SPRINT_KEY = 'last-sprint-viewed'; // key to store selected sprint in local storage
const DESCRIPTION_EXPANDED_KEY = 'sprint-description-expanded';
let debounceTimeId;
export const Sprints = () => {
	const sprints = useLoaderData() as Sprint[];
	const orgId = useParams().orgId as string;
	let defaultSprint: string | Sprint | null =
		localStorage.getItem(SELECTED_SPRINT_KEY);
	// if no stored sprint, default to the first one
	defaultSprint = defaultSprint ? JSON.parse(defaultSprint) : sprints[0];
	defaultSprint =
		!!defaultSprint &&
		sprints.find((s) => s.id === (defaultSprint as Sprint).id)
			? defaultSprint
			: sprints[0];

	const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(
		defaultSprint as Sprint | null
	);
	const [sprintProgress, setSprintProgress] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [targetDeletion, setTargetDeletion] = useState<string>('');
	const [targetSprint, setTargetSprint] = useState<number | null>(0);
	const [confirmDeletionName, setConfirmDeletionName] = useState('');
	const [descriptionExpanded, setDescriptionExpanded] = useState(
		!localStorage.getItem(DESCRIPTION_EXPANDED_KEY) ||
			localStorage.getItem(DESCRIPTION_EXPANDED_KEY) === '1'
	);

	const { mutate: updateSprint } = useMutation({
		mutationFn: patchSprint,
		onError: () => {
			console.error('wuhh');
			setIsLoading(false);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['sprints'] });
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		},
	});

	const handlePatchSprint = (data: Partial<CreateSprintPayload>) => {
		if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
		debounceTimeId = setTimeout(() => {
			updateSprint({
				orgId: orgId,
				sprintId: (selectedSprint as Sprint).id,
				data,
			});
			setIsLoading(true);
		}, 400);
	};
	useEffect(() => {
		if (selectedSprint) {
			localStorage.setItem(SELECTED_SPRINT_KEY, JSON.stringify(selectedSprint));
		}
	}, [selectedSprint]);

	useEffect(() => {
		localStorage.setItem(
			DESCRIPTION_EXPANDED_KEY,
			descriptionExpanded ? '1' : '0'
		);
	}, [descriptionExpanded]);

	const handleEditTitle = (value: string): void => {
		setSelectedSprint((prev) => ({ ...prev!, title: value }));
		if (value) {
			handlePatchSprint({ title: value });
		} else if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
	};

	const handleEditDescription = (value: string): void => {
		setSelectedSprint((prev) => ({ ...prev!, description: value }));
		handlePatchSprint({ description: value });
	};

	const deleteSelectedSprint = async () => {
		const target: number | null =
			targetDeletion === 'backlog' ? null : +targetDeletion;
		setTargetSprint(target);
		try {
			await deleteSprint({ orgId, sprintId: (selectedSprint as Sprint).id });
			await queryClient.invalidateQueries({ queryKey: ['sprints'] });
			localStorage.removeItem(SELECTED_SPRINT_KEY);
			setTargetDeletion('');
			const deletedItem = sprints.findIndex(
				(sprint) => sprint.id === (selectedSprint as Sprint).id
			);
			if (deletedItem !== -1) {
				sprints.splice(deletedItem, 1);
			}
			if (sprints.length) {
				setSelectedSprint(sprints[0]);
			}
		} catch (error) {
			console.warn(error);
		}
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
				<div className="ml-auto flex-1 flex gap-2 items-center">
					<div className="w-fit">
						<SprintSearchInput
							enableAddNew={true}
							sprint={selectedSprint}
							setSprint={(sprint) => setSelectedSprint(sprint)}
						/>
					</div>
					{!!selectedSprint && (
						<div className="pt-2">
							<ConfirmationDialog
								open={openDeleteDialog}
								onClose={() => setOpenDeleteDialog(false)}
								onConfirm={() => {
									deleteSelectedSprint();
									setOpenDeleteDialog(false);
								}}
								title={`Delete sprint "${selectedSprint.title}"?`}
								disabledConfirm={confirmDeletionName !== selectedSprint.title}
								children={
									<>
										<div className="flex flex-col gap-4 pt-4">
											<FormControl>
												<InputLabel size="small" id="sprint-label">
													Move stories to sprint:
												</InputLabel>
												<Select
													variant="outlined"
													size="small"
													margin="dense"
													labelId="sprint-label"
													label="Move stories to sprint:"
													id="targetSprint"
													defaultValue="backlog"
													onChange={(event) => {
														setTargetDeletion(event.target.value);
													}}
												>
													<MenuItem
														value="backlog"
														key="backlog"
														className="!border-b-1 !border-gray-400"
													>
														<p className="text-neutral-regular">Backlog</p>
													</MenuItem>
													{sprints
														.filter((sprint) => sprint.id !== selectedSprint.id)
														.map((sprint) => (
															<MenuItem
																value={sprint.id}
																key={sprint.id ?? 'none'}
															>
																{sprint.title}
															</MenuItem>
														))}
												</Select>
											</FormControl>
											<div>
												<TextField
													variant="outlined"
													size="small"
													margin="dense"
													className="col-span-8"
													fullWidth
													label="Sprint title"
													placeholder={selectedSprint.title}
													value={confirmDeletionName}
													onChange={(e) =>
														setConfirmDeletionName(e.target.value)
													}
												></TextField>
												<small className="text-neutral-regular">
													To confirm deletion, enter the title of the sprint in
													the text input field.
												</small>
											</div>
										</div>
									</>
								}
							/>
						</div>
					)}
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
						<div className="flex flex-col sm:grid sm:grid-cols-12 gap-x-4 sm:items-center relative">
							<div className="col-span-3 pr-16 sm:p-0">
								<TextField
									variant="outlined"
									size="medium"
									required
									margin="dense"
									fullWidth
									label="Title"
									id="title"
									name="title"
									value={selectedSprint.title}
									onChange={(e) => handleEditTitle(e.target.value)}
								></TextField>
							</div>
							<DatePicker
								className="col-span-2"
								label="Sprint Start date"
								name="startDate"
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'medium',
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
								className="col-span-2"
								label="Sprint End date"
								name="endDate"
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'medium',
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
							{/* Progress Bar */}
							<div className="col-span-5 pr-16 text-left">
								<div className="py-2">
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
							<div className="text-right absolute right-0 top-0 sm:top-8">
								<Tooltip
									title="Delete sprint"
									PopperProps={{
										sx: {
											[`& .${tooltipClasses.tooltip}`]: { background: '#000' },
										},
									}}
								>
									<IconButton onClick={() => setOpenDeleteDialog(true)}>
										<Delete color="error" />
									</IconButton>
								</Tooltip>
							</div>
						</div>
						<div
							style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
						>
							<Grid container spacing={2} sx={{ flexGrow: 1 }}>
								<Grid item xs={12}>
									<div
										className="collapsible-header text-left flex items-center gap-2"
										aria-expanded={descriptionExpanded}
									>
										<Button
											onClick={() => setDescriptionExpanded((prev) => !prev)}
										>
											Description
											<ExpandMore />
										</Button>
										<RotateRight
											className="duration-500 text-neutral-regular transition-all animate-spin"
											style={{
												opacity: isLoading ? 1 : 0,
											}}
										/>
									</div>
									<div className="collapsible-content">
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
											id="description"
											name="description"
											multiline
											value={selectedSprint.description}
											rows={8}
											onChange={(e) => handleEditDescription(e.target.value)}
										></TextField>
									</div>
								</Grid>
							</Grid>
						</div>
					</>
				)}
			</Box>
			{/* stories table */}
			{!!selectedSprint && (
				<div className="rounded-xl p-4 bg-white mt-4">
					<SprintStoryTable
						sprint={selectedSprint}
						setSprintProgress={setSprintProgress}
						targetSprint={targetSprint}
						setTargetSprint={setTargetSprint}
					/>
				</div>
			)}
		</>
	);
};
