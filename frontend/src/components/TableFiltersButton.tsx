import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import { FilterIcon, SearchIcon } from '../icons/icons';
import { useState } from 'react';

const TableFiltersButton = ({
	filterCheckedItems,
	filterItems,
	setFilterCheckedItems,
}: {
	filterItems: string[];
	filterCheckedItems: string[];
	setFilterCheckedItems: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const [anchorFilterEl, setAnchorFilterEl3] = useState<null | HTMLElement>(
		null
	);
	const [filterSearchTerm, setFilterSearchTerm] = useState('');

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
			newChecked.length === filterItems.length - 1
		) {
			newChecked.push('Select All');
		} else if (newChecked.includes('Select All')) {
			newChecked = newChecked.filter((item) => item !== 'Select All');
		}
		setFilterCheckedItems(newChecked);
	};
	const filterItemsFiltered = filterItems.filter((item) =>
		item.toLowerCase().includes(filterSearchTerm.toLowerCase())
	);

	return (
		<div>
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
					<div className="px-4 py-2 text-neutral-regular">No results found</div>
				)}
			</Menu>
		</div>
	);
};

export default TableFiltersButton;
