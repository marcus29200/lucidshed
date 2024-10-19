import React, { useEffect, useState } from 'react';
import FieldManagementTable from './FieldManagementTable';
import { ListItemText, Menu, MenuItem } from '@mui/material';
import { Add, FilterAltOutlined, Search } from '@mui/icons-material';

// Define the types for the notifications and component state
interface Notifications {
	email: boolean;
	slack: boolean;
	ownedTickets: boolean;
	followedTickets: boolean;
	mentions: boolean;
}

const WorkflowNotifications: React.FC = () => {
	const [notifications, setNotifications] = useState<Notifications>({
		email: false,
		slack: false,
		ownedTickets: false,
		followedTickets: false,
		mentions: false,
	});

	const [checkedItems, setCheckedItems] = useState<string[]>([]);
	const [anchorEl3, setAnchorEl3] = useState<null | HTMLElement>(null);
	const [searchTerm3, setSearchTerm3] = useState<string>('');
	const [searchBar, setSearchBar] = useState<string>('');

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

	const handleToggle = (key: keyof Notifications) => {
		setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const editField = ['name', 'email', 'createdDate', 'role', 'team'];

	return (
		<div className="w-full px-20 font-poppins">
			<h1 className="text-3xl font-bold mb-6 border-b-2 border-b-green-500 pb-2">
				Workflow and Notifications
			</h1>

			<div>
				<h2 className="text-xl font-semibold mb-2">Notifications</h2>
				<p className="text-gray-600 mb-4 ml-3">
					Notifications can be enabled or disabled by source or change type.
				</p>
			</div>

			<div className="ml-12">
				<div className="mb-6 border-b-2 border-b-green-500 pb-8 -ml-12">
					<div className="space-y-4 ml-12">
						<div>
							<h3 className="font-medium mb-2">Source</h3>
							<div className="space-y-2">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={notifications.email}
										onChange={() => handleToggle('email')}
										className="form-checkbox h-5 w-5 text-green-500"
									/>
									<span>Email</span>
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={notifications.slack}
										onChange={() => handleToggle('slack')}
										className="form-checkbox h-5 w-5 text-green-500"
									/>
									<span>Slack</span>
								</label>
							</div>
						</div>

						<div>
							<h3 className="font-medium mb-2">Notifications</h3>
							<div className="space-y-2">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={notifications.ownedTickets}
										onChange={() => handleToggle('ownedTickets')}
										className="form-checkbox h-5 w-5 text-green-500"
									/>
									<span>Changes to tickets I own</span>
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={notifications.followedTickets}
										onChange={() => handleToggle('followedTickets')}
										className="form-checkbox h-5 w-5 text-green-500"
									/>
									<span>Changes to tickets I follow</span>
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={notifications.mentions}
										onChange={() => handleToggle('mentions')}
										className="form-checkbox h-5 w-5 text-green-500"
									/>
									<span>Mentions</span>
								</label>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-y-5">
					<div className="flex justify-between w-full gap-x-4 mb-4">
						<div className="flex flex-col gap-y-3 -ml-10">
							<h1 className="text-[19px] font-bold text-black">
								Field Management
							</h1>
							<p className="text-sm text-gray-500">
								This includes all available Fields. You Can Add a tag and assign
								it to any Available field.
							</p>
						</div>
						<div className="flex gap-x-5">
							<div className="flex flex-row items-center gap-x-2 py-2 px-3 border-1 border-gray-300 rounded-xl">
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
									<div className="flex flex-row items-center gap-x-2 p-2 border-1 border-gray-300 rounded-xl mb-4">
										<Search className="text-gray-400" />
										<input
											type="text"
											className="p-1 w-full outline-none"
											placeholder="Search..."
											onChange={handleSearch3}
											value={searchTerm3}
											onKeyDown={(e) => e.stopPropagation()} // Prevent focus shift
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
													padding: '4px 8px', // Adjust padding
													marginTop: '8px',
												}}
											>
												<ListItemText
													primary={item}
													sx={{ marginLeft: '4px', marginTop: '8px' }}
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

							<div className="bg-green-600 p-3.5 rounded-full">
								<Add className="text-white" />
							</div>
						</div>
					</div>
				</div>

				<FieldManagementTable
					epics={[]}
					checkedField={checkedItems}
					searchBar={searchBar}
				/>
			</div>
		</div>
	);
};

export default WorkflowNotifications;
