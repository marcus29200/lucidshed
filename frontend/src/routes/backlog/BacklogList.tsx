import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { SearchIcon } from '../../icons/icons';
import { Story } from '../stories/Stories';
import StoriesTable from '../stories/StoriesTable';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import GroupByButton from '../../components/GroupByButton';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
} from '../stories/stories.model';

import { useLoaderData } from 'react-router-dom';
const editFieldsCheckedItems = [
	'name',
	'progress',
	'id',
	'priority',
	'startDate',
	'targetDate',
];

const BACKLOG_STORIES_TABLE_ID = 'backlog-stories-table';

const BacklogList = () => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		id: null,
		startDate: null,
		progress: null,
		targetDate: null,
		priority: null,
		status: null,
	};
	const initialSorting = getStoredSortState(BACKLOG_STORIES_TABLE_ID);
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

	const stories = useLoaderData() as Story[];

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const initialGroupBy = getStoredGroupByOption(BACKLOG_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	useEffect(() => {
		setStoredGroupByOption(BACKLOG_STORIES_TABLE_ID, groupBy);
	}, [groupBy]);

	return (
		<div className="rounded-xl p-4 bg-white mt-4">
			<Box
				sx={{
					paddingBottom: '32px',
				}}
			>
				<Typography variant="h6" textAlign="left">
					Backlog
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

					<div className="flex gap-2">
						<GroupByButton
							options={GROUP_STORIES_OPTIONS}
							selectItem={groupBy}
							setSelectedItem={setGroupBy}
						/>
					</div>
				</Box>
			</Box>

			<StoriesTable
				group={groupBy as GroupStoriesOption}
				tableId={BACKLOG_STORIES_TABLE_ID}
				initialSorting={sortingStates}
				stories={visibleRows}
				checkedField={editFieldsCheckedItems}
				actionsEnabled={false}
			/>
		</div>
	);
};

export default BacklogList;
