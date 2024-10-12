import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import { useState } from 'react';
import { SearchIcon } from '../icons/icons';

const EditFieldsButton = ({
	fields,
	setEditFieldsCheckedItems,
	editFieldsCheckedItems,
}: {
	fields: string[];
	setEditFieldsCheckedItems: React.Dispatch<React.SetStateAction<string[]>>;
	editFieldsCheckedItems: string[];
}) => {
	const [anchorEditFieldsEl, setAnchorEditFieldsEl] =
		useState<null | HTMLElement>(null);
	const [editFieldsSearchTerm, setEditFieldsSearchTerm] = useState('');

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

	const handleEditFieldsToggle = (item: string) => {
		const newChecked = editFieldsCheckedItems.includes(item)
			? editFieldsCheckedItems.filter((checkedItem) => checkedItem !== item)
			: [...editFieldsCheckedItems, item];

		setEditFieldsCheckedItems(newChecked);
	};

	const filteredEditFieldsMenuItems = fields.filter((item) =>
		item.toLowerCase().includes(editFieldsSearchTerm.toLowerCase())
	);

	return (
		<>
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
		</>
	);
};

export default EditFieldsButton;
