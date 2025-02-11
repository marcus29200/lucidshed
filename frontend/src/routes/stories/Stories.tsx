import { Box, Button, Typography } from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import {
	Link,
	useLoaderData,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { mapRawStory, StoryAPI } from '../../api/stories';
import StoriesTable from './StoriesTable';
import { KanbanViewIcon, SearchIcon, TableViewIcon } from '../../icons/icons';
import { useEffect, useState } from 'react';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
	StoriesView,
	StoryStatus,
	storyViewVariants,
} from './stories.model';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import GroupByButton from '../../components/GroupByButton';
import { motion } from 'framer-motion';
import { StoriesKanbanView } from './StoriesKanbanView';

export type Story = {
	id: number;
	name: string;
	targetDate?: Date;
	startDate: Date | null;
	progress: number;
	assignedToId?: string;
	assignedToName?: string;
	iterationId?: number;
	iterationTitle?: string;
	status: StoryStatus;
	createdDate: Date;
	modifiedDate: Date;
	priority: number; // 1 - critical 2 - high 3 - medium 4 - low
	priorityLabel: string;
	statusLabel: string;
};
const editFieldsCheckedItems = [
	'name',
	'progress',
	'id',
	'priority',
	'assignedToName',
	'iterationTitle',
	'startDate',
	'targetDate',
];
const BASE_STORIES_TABLE_ID = 'base-stories-table';
const STORIES_SELECTED_VIEW_ID = 'stories-selected-view';

export const Stories = () => {
	const stories: Story[] = (useLoaderData() as StoryAPI[]).map(mapRawStory);

	const [searchTerm, setSearchTerm] = useState('');
	const userPreferredView =
		localStorage.getItem(STORIES_SELECTED_VIEW_ID) || 'table';
	const [selectedView, setSelectedView] = useState<StoriesView>(
		userPreferredView as StoriesView
	);
	const location = useLocation();
	const navigate = useNavigate();

	const orgId = useParams().orgId as string;

	const initialSorting = getStoredSortState(BASE_STORIES_TABLE_ID);
	const initialGroupBy = getStoredGroupByOption(BASE_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

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
		const queryParams = new URLSearchParams();
		queryParams.set('view', selectedView);
		navigate({ search: queryParams.toString() }, { replace: true });
		localStorage.setItem(STORIES_SELECTED_VIEW_ID, selectedView);
	}, [selectedView, navigate]);

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		setStoredGroupByOption(BASE_STORIES_TABLE_ID, groupBy);
	}, [groupBy]);

	const handleStoryUpdated = (updatedStory: Story) => {
		stories.forEach((story, index) => {
			if (story.id === updatedStory.id) {
				stories[index] = updatedStory;
			}
		});
	};
	const handleSelectView = (view: StoriesView) => {
		setSelectedView(view);
	};

	return (
		<FullHeightSection className="bg-white p-4 shadow !rounded-lg flex flex-col font-poppins">
			<Box
				sx={{
					paddingBottom: '32px',
				}}
			>
				<Typography variant="h6" textAlign="left">
					Stories
				</Typography>
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
						<Link to="new">
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
						tableId={BASE_STORIES_TABLE_ID}
						initialSorting={initialSorting}
						stories={visibleRows}
						checkedField={editFieldsCheckedItems}
						onStoryUpdated={handleStoryUpdated}
					/>
				)}
				{selectedView === 'kanban' && (
					<div>
						{/* kanban view */}
						<StoriesKanbanView stories={visibleRows} orgId={orgId} />
					</div>
				)}
			</motion.div>
		</FullHeightSection>
	);
};
