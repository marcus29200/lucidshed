import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EditFieldsButton from '../../components/EditFieldsButton';
import TableFiltersButton from '../../components/TableFiltersButton';
import { SearchIcon } from '../../icons/icons';
import { Story } from '../stories/Stories';
import StoriesTable from '../stories/StoriesTable';
import { getStoredSortState } from '../../shared/table.utils';

const tableColumnIds = [
	'name',
	'progress',
	'storyId',
	'priority',
	'startDate',
	'targetDate',
];

const SPRINT_STORIES_TABLE_ID = 'sprint-stories-table';

const SprintStoryTable = ({ stories }: { stories: Story[] }) => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		storyId: null,
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
	const { orgId } = useParams();

	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const [editFieldsCheckedItems, setEditFieldsCheckedItems] =
		useState<string[]>(tableColumnIds);

	const filterItems = ['Select All', ...stories.map((story) => story.name)];

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

			<StoriesTable
				tableId={SPRINT_STORIES_TABLE_ID}
				initialSorting={sortingStates}
				stories={visibleRows}
				actionsEnabled={false}
				checkedField={editFieldsCheckedItems}
			/>
		</div>
	);
};

export default SprintStoryTable;
