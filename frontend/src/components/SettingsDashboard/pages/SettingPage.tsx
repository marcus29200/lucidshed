import SiteSettings from '../components/SiteSettings';
import Security from '../components/Security';
import Billing from '../components/Billing';
import Reporting from '../components/Reporting';
import React from 'react';
import {
	Close,
	KeyboardReturn,
	Language,
	LocalOffer,
	MonetizationOnOutlined,
	PeopleAlt,
	Search,
	Settings,
	TrendingUp,
} from '@mui/icons-material';
import { DesktopChatIcon, LockRaidStorageIcon } from '../../../icons/icons';
import { Box, IconButton, Modal } from '@mui/material';
import UserManagement from '../components/UserManagment';
import { BasicModalProps } from '../settings-dashboard.model';

const SettingsModal = ({ open, setOpen }: BasicModalProps) => {
	const [selectedComponent, setSelectedComponent] = React.useState<
		string | null
	>(null);
	const [searchQuery, setSearchQuery] = React.useState(''); // State to store search query

	const menuOptions = [
		{ icon: Settings, title: 'Site Settings', component: 'SiteSettings' },
		{ icon: LockRaidStorageIcon, title: 'Security', component: 'Security' },
		{
			icon: PeopleAlt,
			title: 'User Management',
			component: 'UserManagement',
		},
		{ icon: LocalOffer, title: 'Tags' },
		{ icon: Language, title: 'Product Settings' },
		{ icon: MonetizationOnOutlined, title: 'Billing', component: 'Billing' },
		{
			icon: DesktopChatIcon,
			title: 'WorkFlows and Notifications',
			// component: 'WorkflowNotifications',
		},
		{ icon: TrendingUp, title: 'Reporting', component: 'Reporting' },
	];

	const filteredOptions = menuOptions.filter((option) =>
		option.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const renderComponent = () => {
		switch (selectedComponent) {
			case 'SiteSettings':
				return <SiteSettings />;
			case 'Security':
				return <Security />;
			case 'UserManagement':
				return <UserManagement />;
			// case "Tags":
			//   return <Tags />;
			// case "ProductSetting":
			//   return <ProductSetting />;
			case 'Billing':
				return <Billing />;
			// case 'WorkflowNotifications':
			// 	return <WorkflowNotifications />;
			case 'Reporting':
				return <Reporting />;
			default:
				return null;
		}
	};

	const handleMenuClick = (component) => {
		setSelectedComponent(component);
	};

	return (
		<>
			<Modal
				aria-labelledby="settings"
				aria-describedby="configure settings"
				open={open}
				onClose={() => {
					setOpen(false);
					setSelectedComponent(null);
				}}
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						width: 'calc(100% - 64px)',
						height: 'calc(100% - 64px)',
						borderRadius: '35px',
						boxShadow: '0px 0px 4px 0px #00000040',
						background: 'white',
					}}
				>
					<div className="flex w-full justify-between p-2">
						{selectedComponent && (
							<IconButton onClick={() => setSelectedComponent(null)}>
								<KeyboardReturn fontSize="large" />
							</IconButton>
						)}
						<IconButton
							onClick={() => {
								setOpen(false);
								setSelectedComponent(null);
							}}
							sx={{
								marginLeft: 'auto',
							}}
						>
							<Close fontSize="large" />
						</IconButton>
					</div>
					{selectedComponent ? (
						<div className="w-full h-[calc(100%_-_68px)] overflow-y-auto pb-10">
							{renderComponent()}
						</div>
					) : (
						<div className="flex flex-col w-full gap-y-9">
							<h1 className="text-black font-poppins text-2xl font-bold pl-6 mt-9">
								Admin Settings
							</h1>
							<div
								className="flex justify-center w-[100%] mx-auto bg-transparent"
								style={{
									background:
										'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(76, 175, 80, 1) 50%, rgba(255, 255, 255, 0) 100%)',
									padding: '30px 0',
									backgroundColor: 'transparent',
								}}
							>
								<div className="flex flex-row items-center gap-x-2 py-3 px-3 border-1 w-[50%] border-green-700 rounded-full bg-white">
									<Search className="text-gray-400" />
									<input
										type="text"
										className="p-1 w-full outline-none"
										placeholder="Search..."
										value={searchQuery} // Controlled input value
										onChange={(e) => setSearchQuery(e.target.value)} // Update search query on change
									/>
								</div>
							</div>
							<div className="grid grid-cols-4 gap-y-14 gap-x-10 mx-auto w-[80%] pb-10">
								{filteredOptions.length > 0 ? (
									filteredOptions.map((option) => (
										<MenuOption
											key={option.title}
											icon={option.icon}
											title={option.title}
											onClick={() => handleMenuClick(option.component)}
										/>
									))
								) : (
									<p className="text-center col-span-4">
										No matching options found.
									</p>
								)}
							</div>
						</div>
					)}
				</Box>
			</Modal>
		</>
	);
};

const MenuOption = ({ icon: Icon, title, onClick }) => (
	<div
		className="flex flex-col items-center gap-y-6 hover:scale-110 hover:shadow-lg hover:shadow-gray-400 p-6 rounded-xl transition-all ease-in-out duration-200 cursor-pointer"
		onClick={onClick}
	>
		<Icon className="text-[#21A223] text-7xl font-bold" />
		<h1 className="text-black font-poppins text-[19px] text-center">{title}</h1>
	</div>
);

export default SettingsModal;
