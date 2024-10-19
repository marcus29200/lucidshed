import { Box, Button, Menu, MenuItem, ListItemText } from '@mui/material';

import { FilterIcon, SearchIcon } from '../../icons/icons';
import EpicStoriesTable from './EpicStoriesTable';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Epic } from './Epics';
import { Story } from '../stories/Stories';

// TODO: add typing for epic
const EpicStories = ({ epic: _epic }: { epic: Epic }) => {
	const stories: Story[] = [];
	const orgId = useParams().orgId;
	const [searchTerm, setSearchTerm] = useState('');
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

	// const [activeIcon, setActiveIcon] = useState('list'); // Default active icon

	const [addStoryAnchor, setAddStoryAnchor] = useState<null | HTMLElement>(
		null
	);
	const [searchStoryTerm, setSearchStoryTerm] = useState('');
	const [selectedStories, setSelectedStories] = useState<string[]>([]);

	const filteredItems = stories.filter((epic) =>
		epic.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
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
	const filterItems = stories.length
		? ['Select All', ...stories.map((epic) => epic.name)]
		: [];
	const filterItemsFiltered = filterItems.filter((item) =>
		item.toLowerCase().includes(filterSearchTerm.toLowerCase())
	);
	const editFields = [
		'storyName',
		'progress',
		'ticketNumber',
		'createdDate',
		'modifiedDate',
	];
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
	// const handleIconClick = (icon: string) => {
	// 	setActiveIcon(icon); // Set the clicked icon as active
	// };

	const filteredEditFieldsMenuItems = editFields.filter((item) =>
		item.toLowerCase().includes(editFieldsSearchTerm.toLowerCase())
	);

	const allStories: string[] = [];

	const handleAddStory = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAddStoryAnchor(event.currentTarget);
	};

	const handleCloseAddStory = () => {
		setAddStoryAnchor(null);
	};

	const handleSearchStory = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchStoryTerm(event.target.value);
	};

	// Update handleToggle2 to store the selected story
	const handleToggle2 = (item: string) => {
		const newChecked = selectedStories.includes(item)
			? selectedStories.filter((checkedItem) => checkedItem !== item)
			: [...selectedStories, item];
		setSelectedStories(newChecked);

		// todo: Save the clicked story to selectedStory state
		handleCloseAddStory();
	};
	// Filter stories based on the search term
	const filteredMenuStories = allStories.filter((story) =>
		story.toLowerCase().includes(searchStoryTerm.toLowerCase())
	);

	return (
		<>
			<div className="rounded-xl bg-white p-4">
				<Box className="flex flex-col gap-2">
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							alignSelf: 'flex-end',
						}}
					>
						{/* Search Bar */}
						<div className="flex flex-row items-center gap-x-2 p-2 border border-neutral-light rounded-xl">
							<SearchIcon />
							<input
								type="text"
								className="p-1 w-full outline-none"
								placeholder="Search..."
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
						{/* stories list dropdown */}
						<div className="  flex justify-end items-end">
							<Button
								variant="outlined"
								onClick={handleAddStory}
								sx={{
									paddingX: '76px',
									borderRadius: '10px',
									fontFamily: 'Poppins, sans-serif',
									paddingY: '13px',
									borderColor: '#A7AAB4',
									fontSize: '16px',
								}}
							>
								<span className="text-neutral-regular">Add Story</span>
							</Button>
							<Menu
								anchorEl={addStoryAnchor}
								open={Boolean(addStoryAnchor)}
								onClose={handleCloseAddStory}
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
										onChange={handleSearchStory}
										value={searchStoryTerm}
										onKeyDown={(e) => {
											// Prevent focus shifting to menu items
											e.stopPropagation();
										}}
									/>
								</div>

								{/* Menu Items with Checkboxes */}
								{filteredMenuStories.length > 0 ? (
									filteredMenuStories.map((item, index) => (
										<MenuItem
											key={index}
											onClick={() => handleToggle2(item)} // Click handler for selecting story
											sx={{
												fontFamily: 'Poppins, sans-serif',
												padding: '4px 8px', // Adjust padding to reduce the gap between items
												marginTop: '8px',
											}}
										>
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
									<div className="px-4 py-2 text-gray-500">
										No results found
									</div>
								)}
							</Menu>
						</div>
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
				<EpicStoriesTable
					stories={filteredItems}
					checkedField={editFieldsCheckedItems}
				/>
			</div>
		</>
	);
};

export default EpicStories;
