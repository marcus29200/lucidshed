import { Box, Button } from '@mui/material';

import { SearchIcon } from '../../icons/icons';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Epic } from './Epics';
import { Story } from '../stories/Stories';
import { useQuery } from '@tanstack/react-query';
import { getRelatedStories } from '../../api/epics';
import StoriesTable from '../stories/StoriesTable';
import {
	getStoriesProgress,
	StoriesProgress,
} from '../../shared/stories.mapper';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import GroupByButton from '../../components/GroupByButton';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
	StoriesView,
	storyViewVariants,
} from '../stories/stories.model';
import { StoriesViewSwitcher } from '../stories/components/StoriesViewSwitcher';
import { StoriesKanbanView } from '../stories/StoriesKanbanView';
import { motion } from 'framer-motion';
import { queryClient } from '../../router';
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
const EPIC_STORIES_TABLE_ID = 'epic-stories-table';
const STORIES_SELECTED_VIEW_ID = 'epic-stories-selected-view';
const EpicStories = ({
	epic,
	setProgress,
}: {
	epic: Epic;
	setProgress: (progress: StoriesProgress) => void;
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
	const initialSorting = getStoredSortState(EPIC_STORIES_TABLE_ID);
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
	const orgId = useParams().orgId as string;
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedView, setSelectedView] = useState<StoriesView>('table');
	const { data } = useQuery({
		// add epicId to query key to avoid caching issues when epic
		// see details with different epics
		queryKey: ['epicRelatedStories-' + epic.id],
		queryFn: async () => getRelatedStories(orgId, epic.id),
	});

	const stories: Story[] = data ?? [];

	const filteredItems = stories.filter((epic) =>
		epic.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const initialGroupBy = getStoredGroupByOption(EPIC_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	useEffect(() => {
		setStoredGroupByOption(EPIC_STORIES_TABLE_ID, groupBy as string);
	}, [groupBy]);

	useEffect(() => {
		setProgress(getStoriesProgress(stories));
	}, [stories]);

	const handleStoryUpdated = (updatedStory: Story) => {
		stories.forEach((story, index) => {
			if (story.id === updatedStory.id) {
				stories[index] = updatedStory;
			}
		});
	};
	const handleKanbanChange = async (updatedStories: Story[]) => {
		setProgress(getStoriesProgress(updatedStories));
		stories.forEach((story, index) => {
			const updatedStory = updatedStories.find((s) => s.id === story.id);
			if (story.id === updatedStory?.id) {
				stories[index] = updatedStory;
			}
		});
		await queryClient.invalidateQueries({
			queryKey: ['epicRelatedStories-' + epic.id],
		});
	};

	return (
		<>
			<div className="rounded-xl bg-white p-4">
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
					<StoriesViewSwitcher
						id={STORIES_SELECTED_VIEW_ID}
						onChange={setSelectedView}
					/>
					<div className="flex gap-2">
						<div className="w-[109px]">
							{selectedView === 'table' && (
								<GroupByButton
									options={GROUP_STORIES_OPTIONS}
									selectItem={groupBy}
									setSelectedItem={setGroupBy}
								/>
							)}
						</div>
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
							tableId={EPIC_STORIES_TABLE_ID}
							initialSorting={sortingStates}
							stories={filteredItems}
							actionsEnabled={false}
							checkedField={editFieldsCheckedItems}
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
		</>
	);
};

export default EpicStories;
