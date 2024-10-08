import { useEffect, useState } from 'react';
import {
	Box,
	Button,
	InputAdornment,
	ListItemText,
	Menu,
	MenuItem,
	TextField,
	Typography,
} from '@mui/material';
import EpicsTable from './EpicsTable';
import EpicRow from './EpicRow';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import FullHeightSection from '../../components/FullHeightSection';
import { getEpics } from '../../api/epics';
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { FilterIcon, SearchIcon } from '../../icons/icons';
import Example from './Example';

export const epicsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['epics', orgId],
		queryFn: async () => getEpics(orgId),
	});

export type ApiEpic = {
	id: number;
	title: string;
	description?: string;
	estimated_completion_date: string;
	start_date: string | null;
};

export type Epic = {
	name: string;
	progress: number;
	epicId: number;
	startDate: string;
	endDate: string;
};

export const loader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No org id provided');
		}
		return getEpics(params.orgId);
		// return await queryClient.ensureQueryData(epicsQuery(params.orgId, params.search))
	};
};

export const Epics = () => {
	const epics: Epic[] = (useLoaderData() as ApiEpic[]).map((epic) => ({
		name: epic.title,
		progress: 0,
		epicId: epic.id,
		startDate: epic.start_date || '-',
		endDate: epic.estimated_completion_date,
	}));

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

	const filteredItems = epics.filter((epic) =>
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
			newChecked.length === epics.length
		) {
			newChecked.push('Select All');
		} else if (newChecked.includes('Select All')) {
			newChecked = newChecked.filter((item) => item !== 'Select All');
		}
		setFilterCheckedItems(newChecked);
	};
	const filterItems = ['Select All', ...epics.map((epic) => epic.name)];
	const filterItemsFiltered = filterItems.filter((item) =>
		item.toLowerCase().includes(filterSearchTerm.toLowerCase())
	);
	const editFields = ['name', 'progress', 'epicId', 'startDate', 'endDate'];
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
		setEditFieldsCheckedItems(editFields);
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
		<FullHeightSection className="bg-white p-4 shadow rounded-lg flex flex-col font-poppins">
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingX: '12px',
					paddingY: '6px',
				}}
			>
				<Typography variant="h6" className="!text-lg !font-semibold">
					Epics
				</Typography>
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
								placeholder="Search Epic Here"
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
								Create Epic
							</Button>
						</Link>
					</Box>
					<Box className="self-end flex gap-2">
						<Button
							variant="outlined"
							onClick={handleClickEditFields}
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
						</Button>
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
			<EpicsTable epics={filteredItems} checkedField={editFieldsCheckedItems} />
		</FullHeightSection>
	);
};
