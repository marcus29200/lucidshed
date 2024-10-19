import { ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';

import UserManagementTable from './UserManagmentTable';
import { Add, FilterAltOutlined, Search } from '@mui/icons-material';

const UserManagement: React.FC = () => {
	const [anchorEl3, setAnchorEl3] = useState<null | HTMLElement>(null);
	const [searchTerm3, setSearchTerm3] = useState('');
	const [checkedItems, setCheckedItems] = useState<string[]>([]);
	const [searchBar, setSearchBar] = useState('');
	const editField = ['name', 'email', 'createdDate', 'role', 'team'];

	const handleSearchChange = (event) => {
		console.log('handleSearchChange', event.target.value);
		setSearchBar(event.target.value);
	};
	useEffect(() => {
		setCheckedItems(editField);
	}, []);

	const menuItems3 = ['Select All', 'Epic 1', 'Epic 2', 'Epic 3', 'Epic 4'];
	const handleClick3 = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl3(event.currentTarget);
	};

	const handleClose3 = () => {
		setAnchorEl3(null);
	};

	const handleSearch3 = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm3(event.target.value);
	};

	const handleToggle3 = (item: string) => {
		const currentIndex = checkedItems.indexOf(item);
		const newChecked = [...checkedItems];

		if (currentIndex === -1) {
			newChecked.push(item);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setCheckedItems(newChecked);
	};

	const filteredMenuItems3 = menuItems3.filter((item) =>
		item.toLowerCase().includes(searchTerm3.toLowerCase())
	);
	return (
		<div className="flex flex-col gap-y-5 w-full px-10">
			<h1 className="text-black font-poppins text-2xl font-bold pl-0 border-b-2 border-b-green-500 pb-2">
				User Management
			</h1>
			<div className="flex flex-row w-[70%] gap-x-2">
				<div className="flex flex-row items-center w-[30%] gap-x-2 py-2 px-3 border-1 border-gray-300 rounded-xl">
					<Search className="text-gray-400" />
					<input
						type="text"
						className="p-1 w-full outline-none"
						placeholder="Search..."
						onChange={handleSearchChange} // Set the state on change
					/>
				</div>
				<div className="flex justify-end items-end">
					<button
						onClick={handleClick3}
						className="border-1 border-gray-300 bg-transparent flex py-4 px-14 rounded-xl space-x-2"
					>
						<FilterAltOutlined className="text-gray-400" />
						<span>Filter</span>
					</button>

					<Menu
						anchorEl={anchorEl3}
						open={Boolean(anchorEl3)}
						onClose={handleClose3}
						PaperProps={{
							style: {
								width: '290px',
								padding: '10px',
							},
						}}
					>
						{/* Search Bar */}
						<div className="flex flex-row items-center gap-x-2 p-2 border-1 border-gray-300 rounded-xl mb-4">
							<Search className="text-gray-400" />
							<input
								type="text"
								className="p-1 w-full outline-none"
								placeholder="Search..."
								onChange={handleSearch3}
								value={searchTerm3}
								onKeyDown={(e) => {
									// Prevent focus shifting to menu items
									e.stopPropagation();
								}}
							/>
						</div>

						{/* Menu Items with Checkboxes */}
						{filteredMenuItems3.length > 0 ? (
							filteredMenuItems3.map((item, index) => (
								<MenuItem
									key={index}
									onClick={() => handleToggle3(item)}
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
							<div className="px-4 py-2 text-gray-500">No results found</div>
						)}
					</Menu>
				</div>
				<div className="bg-green-600 p-3.5 rounded-full w-fit">
					<Add className="text-white" />
				</div>
			</div>
			<UserManagementTable
				searchBar={searchBar}
				epics={[]}
				checkedField={checkedItems}
			/>
		</div>
	);
};

export default UserManagement;
