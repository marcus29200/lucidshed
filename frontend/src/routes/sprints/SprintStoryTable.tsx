import { Box, Button, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EditFieldsButton from '../../components/EditFieldsButton';
import TableFiltersButton from '../../components/TableFiltersButton';
import { SearchIcon } from '../../icons/icons';
import { Story } from '../stories/Stories';
import StoriesTable from '../stories/StoriesTable';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import { TableActions } from '../../components/Table';
import { ConfirmationDialog } from '../../components/DeleteDialog';
import GroupByButton from '../../components/GroupByButton';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
} from '../stories/stories.model';

const tableColumnIds = [
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

	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const [editFieldsCheckedItems, setEditFieldsCheckedItems] =
		useState<string[]>(tableColumnIds);

	const filterItems = ['Select All', ...stories.map((story) => story.name)];

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
					justifyContent: 'flex-end',
					paddingX: '12px',
					paddingY: '6px',
				}}
			>
				<Box className="flex flex-col gap-2">
					<Box
						sx={{
							display: 'flex',
							gap: '8px',
						}}
					>
						{/* Search Bar */}
						<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-2.5 border border-neutral-light rounded-xl">
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
						{/* filters  */}
						<TableFiltersButton
							filterItems={filterItems}
							filterCheckedItems={filterCheckedItems}
							setFilterCheckedItems={setFilterCheckedItems}
						/>
						{/* create epic and edit fields button */}
						<div className="grid gap-2">
							{/* Navigation to new story flow */}
							<Link to={`/${orgId}/stories/new`}>
								<Button
									variant="contained"
									sx={{
										paddingX: '70px',
										borderRadius: '10px',
										fontFamily: 'Poppins, sans-serif',
										paddingY: '13px',
										fontSize: '16px',
									}}
								>
									Create Story
								</Button>
							</Link>
							{/* edit fields */}
							<EditFieldsButton
								fields={tableColumnIds}
								setEditFieldsCheckedItems={setEditFieldsCheckedItems}
								editFieldsCheckedItems={editFieldsCheckedItems}
							/>
						</div>
					</Box>
				</Box>
			</Box>
			{!!visibleRows.length && (
				<div className="text-left">
					<GroupByButton
						options={GROUP_STORIES_OPTIONS}
						selectItem={groupBy}
						setSelectedItem={setGroupBy}
					/>
				</div>
			)}
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
