import { Box, Button, Typography } from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import { Link, useLoaderData } from 'react-router-dom';
import { mapRawStory, StoryAPI } from '../../api/stories';
import StoriesTable from './StoriesTable';
import { SearchIcon } from '../../icons/icons';
import { useEffect, useState } from 'react';
import {
	GROUP_STORIES_OPTIONS,
	GroupStoriesOption,
	StoryStatus,
} from './stories.model';
import {
	getStoredGroupByOption,
	getStoredSortState,
	setStoredGroupByOption,
} from '../../shared/table.utils';
import GroupByButton from '../../components/GroupByButton';

export type Story = {
	id: number;
	name: string;
	targetDate: Date;
	startDate: Date | null;
	progress: number;
	assignedToId?: string;
	status: StoryStatus;
	orgId: string;
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
	'startDate',
	'targetDate',
];
const BASE_STORIES_TABLE_ID = 'base-stories-table';
export const Stories = () => {
	const stories: Story[] = (useLoaderData() as StoryAPI[]).map(mapRawStory);

	const [searchTerm, setSearchTerm] = useState('');

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const initialSorting = getStoredSortState(BASE_STORIES_TABLE_ID);
	const initialGroupBy = getStoredGroupByOption(BASE_STORIES_TABLE_ID);
	const [groupBy, setGroupBy] = useState<string | undefined>(initialGroupBy);

	useEffect(() => {
		setStoredGroupByOption(BASE_STORIES_TABLE_ID, groupBy);
	}, [groupBy]);

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

					<div className="flex gap-2">
						<GroupByButton
							options={GROUP_STORIES_OPTIONS}
							selectItem={groupBy}
							setSelectedItem={setGroupBy}
						/>
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

			<StoriesTable
				group={groupBy as GroupStoriesOption}
				tableId={BASE_STORIES_TABLE_ID}
				initialSorting={initialSorting}
				stories={visibleRows}
				checkedField={editFieldsCheckedItems}
			/>
		</FullHeightSection>
	);
};
