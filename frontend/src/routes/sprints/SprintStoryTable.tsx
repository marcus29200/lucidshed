import { Box, Button, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchIcon } from '../../icons/icons';
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
} from '../stories/stories.model';

const editFieldsCheckedItems = [
	'name',
	'progress',
	'id',
	'priority',
	'startDate',
	'targetDate',
];

const SPRINT_STORIES_TABLE_ID = 'sprint-stories-table';

const SprintStoryTable = ({
	stories,
	handleRemoveStory,
}: {
	stories: Story[];
	handleRemoveStory: (storyId: number) => void;
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

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const initialGroupBy = getStoredGroupByOption(SPRINT_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	useEffect(() => {
		setStoredGroupByOption(SPRINT_STORIES_TABLE_ID, groupBy as string);
	}, [groupBy]);

	const actions: TableActions<Story> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.original.id}-0`}
			onClick={() => {
				closeMenu();
				handleRemoveStory(row.original.id);
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

				<div className="flex gap-2">
					<GroupByButton
						options={GROUP_STORIES_OPTIONS}
						selectItem={groupBy}
						setSelectedItem={setGroupBy}
					/>
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

			<StoriesTable
				group={groupBy as GroupStoriesOption}
				tableId={SPRINT_STORIES_TABLE_ID}
				initialSorting={sortingStates}
				stories={visibleRows}
				checkedField={editFieldsCheckedItems}
				parentActions={actions}
			/>
		</div>
	);
};

export default SprintStoryTable;
