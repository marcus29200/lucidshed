import {
	Box,
	Button,
	Typography,
	TextField,
	ListItemText,
	Menu,
	MenuItem,
} from '@mui/material';
import FullHeightSection from '../../components/FullHeightSection';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { getStories, StoryAPI } from '../../api/stories';
import StoryRow from './StoryRow';
import StoriesTable, { getComparator } from './StoriesTable';
import { useEffect, useMemo, useState } from 'react';
import {
	SearchIcon,
	FilterIcon,
	TableViewIcon,
	KanbanViewIcon,
} from '../../icons/icons';
import EmptyRows from './EmptyRows';

export const storiesQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['stories', orgId, search],
		queryFn: async () => getStories(orgId, search),
	});

export const loader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		// something is fucked up with the queryKey...
		return getStories(orgId, search);
		// return queryClient.ensureQueryData(storiesQuery(orgId, search));
	};
};

export type Story = {
	storyId: number;
	name: string;
	targetDate: Date;
	startDate: Date | null;
	progress: number;
};

// TODO: stories table
export const Stories = () => {
	const stories: Story[] = (useLoaderData() as StoryAPI[]).map(
		(story: StoryAPI) => ({
			targetDate: story.estimated_completion_date,
			storyId: story.id,
			name: story.title,
			progress: 0,
			startDate: story.start_date,
		})
	);
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState('name');

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const [searchTerm, setSearchTerm] = useState('');

	const visibleRows: Story[] = useMemo(
		() =>
			[...stories]
				.filter((story) =>
					story.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
				.sort(getComparator(order, orderBy)),
		[order, orderBy, stories, searchTerm]
	);

	const [anchorFilterEl, setAnchorFilterEl3] = useState<null | HTMLElement>(
		null
	);
	const [filterSearchTerm, setFilterSearchTerm] = useState('');
	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);

	const [anchorEditFieldsEl, setAnchorEditFieldsEl] =
		useState<null | HTMLElement>(null);
	const [editFieldsSearchTerm, setEditFieldsSearchTerm] = useState('');
	const [editFieldsCheckedItems, setEditFieldsCheckedItems] = useState<
		string[]
	>([]);

	const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorFilterEl3(event.currentTarget);
	};

	const handleCloseFilterMenu = () => {
		setAnchorFilterEl3(null);
	};

	const handleFilterSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterSearchTerm(event.target.value);
	};

	const handleToggleFilter = (item: string) => {
		const currentIndex = filterCheckedItems.indexOf(item);

		if (item === 'Select All') {
			setFilterCheckedItems(currentIndex !== -1 ? [] : filterItems.slice(0));
			return;
		}

		let newChecked = [...filterCheckedItems];
		if (currentIndex === -1) {
			newChecked.push(item);
		} else {
			newChecked.splice(currentIndex, 1);
		}
		if (
			!newChecked.includes('Select All') &&
			newChecked.length === stories.length
		) {
			newChecked.push('Select All');
		} else if (newChecked.includes('Select All')) {
			newChecked = newChecked.filter((item) => item !== 'Select All');
		}
		setFilterCheckedItems(newChecked);
	};
	const filterItems = ['Select All', ...stories.map((story) => story.name)];
	const filterItemsFiltered = filterItems.filter((item) =>
		item.toLowerCase().includes(filterSearchTerm.toLowerCase())
	);
	const editFields = ['name', 'progress', 'storyId', 'startDate', 'targetDate'];
	const handleClickEditFields = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		setAnchorEditFieldsEl(event.currentTarget);
	};

	const handleCloseEditFields = () => {
		setAnchorEditFieldsEl(null);
	};

	const handleEditFieldsSearch = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setEditFieldsSearchTerm(event.target.value);
	};

	useEffect(() => {
		setEditFieldsCheckedItems(() => [...editFields, 'actions']);
	}, []);
	const handleEditFieldsToggle = (item: string) => {
		const newChecked = editFieldsCheckedItems.includes(item)
			? editFieldsCheckedItems.filter((checkedItem) => checkedItem !== item)
			: [...editFieldsCheckedItems, item];

		setEditFieldsCheckedItems(newChecked);
	};

	const filteredEditFieldsMenuItems = editFields.filter((item) =>
		item.toLowerCase().includes(editFieldsSearchTerm.toLowerCase())
	);

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
							alignItems: 'center',
							gap: '8px',
							gridTemplateColumns: '',
						}}
					>
						{/* Search Bar */}
						<div className="flex flex-row items-center gap-x-2 p-2 border border-neutral-light rounded-xl">
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
						{/* filters */}
						<div className="flex justify-end items-end">
							<Button
								variant="outlined"
								onClick={handleFilterClick}
								sx={{
									paddingX: '20px',
									borderRadius: '10px',
									fontFamily: 'Poppins, sans-serif',
									paddingY: '13px',
									borderColor: '#A7AAB4',
									fontSize: '16px',
								}}
							>
								<FilterIcon className="!w-4" />
								<span className="text-neutral-regular">Filter</span>
							</Button>

							<Menu
								anchorEl={anchorFilterEl}
								open={Boolean(anchorFilterEl)}
								onClose={handleCloseFilterMenu}
								slotProps={{
									paper: {
										style: {
											width: '290px',
											padding: '10px',
										},
									},
								}}
							>
								{/* Search Bar */}
								<div className="flex flex-row items-center gap-x-2 p-2 border border-neutral-light rounded-xl mb-4">
									<SearchIcon />
									<input
										type="text"
										className="p-1 w-full outline-none"
										placeholder="Search..."
										onChange={handleFilterSearch}
										value={filterSearchTerm}
										onKeyDown={(e) => {
											// Prevent focus shifting to menu items
											e.stopPropagation();
										}}
									/>
								</div>

								{/* Menu Items with Checkboxes */}
								{filterItemsFiltered.length > 0 ? (
									filterItemsFiltered.map((item) => (
										<MenuItem
											key={item}
											onClick={() => handleToggleFilter(item)}
											sx={{
												fontFamily: 'Poppins, sans-serif',
												padding: '4px 8px', // Adjust padding to reduce the gap between items
												marginTop: '8px',
											}}
										>
											<input
												type="checkbox"
												checked={filterCheckedItems.includes(item)}
												onChange={() => handleToggleFilter(item)}
												onClick={(e) => e.stopPropagation()}
											/>
											<ListItemText
												primary={item}
												sx={{
													marginLeft: '4px',
													marginTop: '8px',
												}} // Adjust text margin
											/>
										</MenuItem>
									))
								) : (
									<div className="px-4 py-2 text-neutral-regular">
										No results found
									</div>
								)}
							</Menu>
						</div>
						{/* Navigation to new epic flow */}
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
					</Box>
					<Box className="self-end flex gap-2">
						{/* edit fields */}
						<Button
							variant="outlined"
							onClick={handleClickEditFields}
							sx={{
								paddingX: '76px',
								borderRadius: '10px',
								fontFamily: 'Poppins, sans-serif',
								paddingY: '13px',
								borderColor: '#A7AAB4',
								fontSize: '16px',
							}}
						>
							<span className="text-neutral-regular">Edit Fields</span>
						</Button>
						<Menu
							anchorEl={anchorEditFieldsEl}
							open={Boolean(anchorEditFieldsEl)}
							onClose={handleCloseEditFields}
							slotProps={{
								paper: {
									style: {
										width: '290px',
										padding: '10px',
									},
								},
							}}
						>
							{/* Search Bar */}
							<div className="flex flex-row items-center gap-x-2 p-2 border border-neutral-light rounded-xl mb-4">
								<SearchIcon />
								<input
									type="text"
									className="p-1 w-full outline-none"
									placeholder="Search..."
									onChange={handleEditFieldsSearch}
									value={editFieldsSearchTerm}
									onKeyDown={(e) => {
										// Prevent focus shifting to menu items
										e.stopPropagation();
									}}
								/>
							</div>

							{/* Menu Items with Checkboxes */}
							{filteredEditFieldsMenuItems.length > 0 ? (
								filteredEditFieldsMenuItems.map((item) => (
									<MenuItem
										key={item}
										sx={{
											fontFamily: 'Poppins, sans-serif',
											padding: '4px 8px', // Adjust padding to reduce the gap between items
											marginTop: '8px',
											display: 'flex',
											alignItems: 'center', // Aligns checkbox and text
										}}
										onClick={() => handleEditFieldsToggle(item)} // Toggle item on click
									>
										<input
											type="checkbox"
											className="p-2 mr-2"
											checked={editFieldsCheckedItems.includes(item)} // Check if the item is selected
											onChange={() => handleEditFieldsToggle(item)} // Update state on change
											onClick={(e) => e.stopPropagation()} // Prevent click event from triggering twice
										/>
										<ListItemText
											primary={item}
											sx={{
												fontFamily: 'Poppins, sans-serif',
												marginLeft: '8px',
											}} // Adjust text margin
										/>
									</MenuItem>
								))
							) : (
								<div className="px-4 py-2 text-gray-500">No results found</div>
							)}
						</Menu>
					</Box>
				</Box>
			</Box>

			<StoriesTable
				handleRequestSort={handleRequestSort}
				order={order}
				orderBy={orderBy}
				checkedField={editFieldsCheckedItems}
			>
				{visibleRows.length ? (
					visibleRows.map((story) => (
						<StoryRow
							story={story}
							key={story.storyId}
							checkedField={editFieldsCheckedItems}
						/>
					))
				) : (
					<EmptyRows />
				)}
			</StoriesTable>
		</FullHeightSection>
	);
};
