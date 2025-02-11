import { Box, Button, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { KanbanViewIcon, SearchIcon, TableViewIcon } from '../../icons/icons';
import { Story } from '../stories/Stories';
import StoriesTable from '../stories/StoriesTable';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import { TableActions } from '../../components/Table';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import GroupByButton from '../../components/GroupByButton';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
	StoriesView,
	storyViewVariants,
} from '../stories/stories.model';
import { getStoriesForSprint, Sprint } from '../../api/sprints';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getStoriesProgress } from '../../shared/stories.mapper';
import { StoryAPI, updateStory } from '../../api/stories';
import { StoriesKanbanView } from '../stories/StoriesKanbanView';
import { motion } from 'framer-motion';
import { queryClient } from '../../router';

const editFieldsCheckedItems = [
	'name',
	'progress',
	'id',
	'priority',
	'assignedToName',
	'startDate',
	'targetDate',
];

const SPRINT_STORIES_TABLE_ID = 'sprint-stories-table';
const STORIES_SELECTED_VIEW_ID = 'sprint-stories-selected-view';

const SprintStoryTable = ({
	sprint,
	setSprintProgress,
	targetSprint,
	setTargetSprint,
}: {
	sprint: Sprint;
	setSprintProgress: React.Dispatch<React.SetStateAction<number>>;
	targetSprint: number | null;
	setTargetSprint: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		id: null,
		startDate: null,
		progress: null,
		targetDate: null,
		priority: null,
		status: null,
	};
	const initialSorting = getStoredSortState(SPRINT_STORIES_TABLE_ID);
	if (Object.keys(initialSorting).length) {
		for (const key in sortStates) {
			if (Object.prototype.hasOwnProperty.call(sortStates, key)) {
				if (initialSorting[key] !== undefined) {
					sortStates[key] = initialSorting[key];
				} else {
					sortStates[key] = null;
				}
			}
		}
	}
	const [sortingStates] = useState<{
		[key: string]: boolean | null;
	}>(sortStates);
	const [searchTerm, setSearchTerm] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const orgId = useParams().orgId as string;

	const location = useLocation();
	const navigate = useNavigate();
	const { data } = useQuery({
		// add sprintId to query key to avoid caching issues when sprint
		// see details with different sprints
		queryKey: ['sprintRelatedStories-' + sprint.id],
		queryFn: async () => getStoriesForSprint({ orgId, sprintId: sprint.id }),
	});

	const stories: Story[] = data ?? [];

	const filteredItems = stories.filter((epic) =>
		epic.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const initialGroupBy = getStoredGroupByOption(SPRINT_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	const userPreferredView =
		localStorage.getItem(STORIES_SELECTED_VIEW_ID) || 'table';
	const [selectedView, setSelectedView] = useState<StoriesView>(
		userPreferredView as StoriesView
	);

	const { mutate: patchStory } = useMutation({
		mutationFn: updateStory,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async (updatedStory: StoryAPI) => {
			handleRemoveStory(updatedStory.id);
		},
	});

	useEffect(() => {
		setStoredGroupByOption(SPRINT_STORIES_TABLE_ID, groupBy as string);
	}, [groupBy]);

	useEffect(() => {
		setSprintProgress(getStoriesProgress(stories).progress);
	}, [stories]);

	useEffect(() => {
		if (targetSprint !== 0) {
			stories.forEach((story) => {
				patchStory({
					orgId,
					storyId: story.id,
					data: { iteration_id: targetSprint },
				});
			});
			setTargetSprint(0);
		}
	}, [targetSprint]);
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const viewFromQuery = queryParams.get('view') as StoriesView | null;
		if (viewFromQuery && ['table', 'kanban'].includes(viewFromQuery)) {
			setSelectedView(viewFromQuery);
		} else {
			// If the query param is not valid or missing, use the stored preference
			const userPreferredView =
				localStorage.getItem(STORIES_SELECTED_VIEW_ID) || 'table';
			setSelectedView(userPreferredView as StoriesView);
		}
	}, [location.search]);

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		queryParams.set('view', selectedView);
		navigate({ search: queryParams.toString() }, { replace: true });
		localStorage.setItem(STORIES_SELECTED_VIEW_ID, selectedView);
	}, [selectedView, navigate]);
	const handleStoryUpdated = (updatedStory: Story) => {
		stories.forEach((story, index) => {
			if (story.id === updatedStory.id) {
				stories[index] = updatedStory;
			}
		});
		setSprintProgress(getStoriesProgress(stories).progress);
	};

	const handleRemoveStory = (id: number) => {
		const removed = stories.findIndex((story) => story.id === id);
		if (removed !== -1) {
			stories.splice(removed, 1);
			setSprintProgress(getStoriesProgress(stories).progress);
		}
	};
	const handleSelectView = (view: StoriesView) => {
		setSelectedView(view);
	};

	const handleKanbanChange = async (updatedStories: Story[]) => {
		setSprintProgress(getStoriesProgress(updatedStories).progress);
		stories.forEach((story, index) => {
			const updatedStory = updatedStories.find((s) => s.id === story.id);
			if (story.id === updatedStory?.id) {
				stories[index] = updatedStory;
			}
		});
		await queryClient.invalidateQueries({
			queryKey: ['sprintRelatedStories-' + sprint.id],
		});
	};

	const actions: TableActions<Story> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.original.id}-0`}
			onClick={() => {
				closeMenu();
				patchStory({
					orgId,
					storyId: row.original.id,
					data: { iteration_id: null },
				});
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif', color: 'red' }}
		>
			Remove from sprint
		</MenuItem>,
		<div key={`${row.original.id}-1`}>
			{/* Dialog box */}
			<ConfirmationDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onConfirm={() => {
					closeMenu();
					handleRemoveStory(row.original.id);
				}}
				children={
					<span className="text-neutral-regular text-base">
						Are you sure you want to remove this story ?
					</span>
				}
			/>
		</div>,
	];

	return (
		<div>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: '8px',
				}}
			>
				{/* Search Bar */}
				<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-1 border border-neutral-light rounded-xl">
					<SearchIcon />
					<input
						type="text"
						className="p-1 w-full outline-none"
						placeholder="Search Stories Here"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => {
							// Prevent focus shifting to menu items
							e.stopPropagation();
						}}
					/>
				</div>
				<div className="flex items-center gap-4">
					<Button
						variant={selectedView === 'table' ? 'contained' : 'text'}
						color="primary"
						startIcon={<TableViewIcon />}
						onClick={() => handleSelectView('table')}
					>
						Table View
					</Button>
					<Button
						variant={selectedView === 'kanban' ? 'contained' : 'text'}
						color="primary"
						startIcon={<KanbanViewIcon />}
						onClick={() => handleSelectView('kanban')}
					>
						Kanban view
					</Button>
				</div>
				<div className="flex gap-2">
					{selectedView === 'table' && (
						<GroupByButton
							options={GROUP_STORIES_OPTIONS}
							selectItem={groupBy}
							setSelectedItem={setGroupBy}
						/>
					)}
					{/* Navigation to new story flow */}
					<Link to={`/${orgId}/stories/new`}>
						<Button
							variant="contained"
							sx={{
								paddingX: '16px',
								borderRadius: '10px',
								fontFamily: 'Poppins, sans-serif',
								paddingY: '8px',
								fontSize: '16px',
							}}
						>
							Create Story
						</Button>
					</Link>
				</div>
			</Box>

			<motion.div
				key={selectedView}
				variants={storyViewVariants}
				initial="initial"
				animate={selectedView}
				transition={{ duration: 0.5, type: 'tween' }}
			>
				{/* table view */}
				{selectedView === 'table' && (
					<StoriesTable
						group={groupBy as GroupStoriesOption}
						tableId={SPRINT_STORIES_TABLE_ID}
						initialSorting={sortingStates}
						stories={filteredItems}
						checkedField={editFieldsCheckedItems}
						parentActions={actions}
						onStoryUpdated={handleStoryUpdated}
					/>
				)}
				{selectedView === 'kanban' && (
					<div>
						{/* kanban view */}
						<StoriesKanbanView
							stories={filteredItems}
							orgId={orgId}
							onChange={handleKanbanChange}
						/>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default SprintStoryTable;
