import { Box, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import EditFieldsButton from '../../components/EditFieldsButton';
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
import { useQuery } from '@tanstack/react-query';
import {
	getStoriesWithoutIteration,
	mapRawStory,
	updateStory,
} from '../../api/stories';
import { useParams } from 'react-router-dom';
import { TableActions } from '../../components/Table';
import { Sprint } from '../../api/sprints';

const tableColumnIds = [
	'name',
	'progress',
	'storyId',
	'priority',
	'startDate',
	'targetDate',
];

const BACKLOG_STORIES_TABLE_ID = 'backlog-stories-table';

const BacklogStoriesTable = ({
	removedStory,
	setAddedStory,
	selectedSprint,
}: {
	removedStory: Story | undefined;
	setAddedStory: React.Dispatch<React.SetStateAction<Story | undefined>>;
	selectedSprint: Sprint;
}) => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		storyId: null,
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

	const orgId = useParams().orgId as string;

	const { data } = useQuery({
		queryKey: ['storiesWithoutIteration'],
		queryFn: async () => getStoriesWithoutIteration(orgId),
	});
	const stories = data ?? [];
	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const [editFieldsCheckedItems, setEditFieldsCheckedItems] =
		useState<string[]>(tableColumnIds);

	const initialGroupBy = getStoredGroupByOption(BACKLOG_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	useEffect(() => {
		setStoredGroupByOption(BACKLOG_STORIES_TABLE_ID, groupBy);
	}, [groupBy]);

	useEffect(() => {
		if (removedStory) {
			stories.push(removedStory);
		}
	}, [removedStory]);

	const handleAddStory = (storyId: number) => {
		updateStory({
			orgId,
			storyId,
			data: { iteration_id: selectedSprint.id },
		}).then((story) => {
			setAddedStory(() => mapRawStory(story));
			const toRemove = stories.findIndex((s) => s.storyId === storyId);
			if (toRemove !== -1) {
				stories.splice(toRemove, 1);
			}
		});
	};

	const actions: TableActions<Story> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.original.storyId}-0`}
			onClick={() => {
				closeMenu();
				handleAddStory(row.original.storyId);
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Move to "{selectedSprint.title}"
		</MenuItem>,
	];
	if (!visibleRows.length) {
		return (
			<div className="text-neutral-regular italic pb-4">
				No stories in backlog
			</div>
		);
	}

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
						{/* edit fields */}
						<EditFieldsButton
							fields={tableColumnIds}
							setEditFieldsCheckedItems={setEditFieldsCheckedItems}
							editFieldsCheckedItems={editFieldsCheckedItems}
						/>
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
				tableId={BACKLOG_STORIES_TABLE_ID}
				initialSorting={sortingStates}
				stories={visibleRows}
				checkedField={editFieldsCheckedItems}
				parentActions={actions}
			/>
		</div>
	);
};

export default BacklogStoriesTable;
