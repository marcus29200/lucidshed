import { Box, Button, Typography } from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import { Link, useLoaderData } from 'react-router-dom';
import { mapRawStory, StoryAPI } from '../../api/stories';
import StoriesTable from './StoriesTable';
import { SearchIcon } from '../../icons/icons';
import EditFieldsButton from '../../components/EditFieldsButton';
import { useState } from 'react';
import TableFiltersButton from '../../components/TableFiltersButton';
import { StoryStatus } from './stories.model';

export type Story = {
	storyId: number;
	name: string;
	targetDate: Date;
	startDate: Date | null;
	progress: number;
	assignedToId?: string;
	status?: StoryStatus;
	orgId: string;
	createdDate: Date;
	modifiedDate: Date;
	priority?: number; // 1 - critical 2 - high 3 - medium 4 - low
};
const tableColumnIds = [
	'name',
	'progress',
	'storyId',
	'priority',
	'startDate',
	'targetDate',
];

export const Stories = () => {
	const stories: Story[] = (useLoaderData() as StoryAPI[]).map(mapRawStory);

	const [searchTerm, setSearchTerm] = useState('');

	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);

	const visibleRows: Story[] = [...stories].filter((story) =>
		story.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const [editFieldsCheckedItems, setEditFieldsCheckedItems] =
		useState<string[]>(tableColumnIds);

	const filterItems = ['Select All', ...stories.map((story) => story.name)];

	return (
		<FullHeightSection className="bg-white p-4 shadow !rounded-lg flex flex-col font-poppins">
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					paddingX: '12px',
					paddingY: '6px',
				}}
			>
				<Typography variant="h6">Stories</Typography>
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
							<Link to="new">
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
				stories={visibleRows}
				checkedField={editFieldsCheckedItems}
			/>
		</FullHeightSection>
	);
};
