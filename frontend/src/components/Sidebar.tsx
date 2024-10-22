import { Box, Divider, Drawer, List } from '@mui/material';
import { useEffect, useState } from 'react';
import { BookIcon, DashboardIcon, EpicIcon, SprintIcon } from '../icons/icons';
import { Checklist, NavigateBefore, Settings } from '@mui/icons-material';
import SettingsModal from './SettingsDashboard/pages/SettingPage';
import SidebarItem from './SidebarItem';

export type NavigationItem = {
	label: string;
	to?: string;
	icon: () => JSX.Element;
	canAdd?: boolean;
	children?: NavigationItem[];
	dropDown?: () => JSX.Element; // TODO: Implement drop down menu
	paddingOffset?: number; // px
};

const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		to: '',
		label: 'Dashboard',
		icon: () => <DashboardIcon />,
	},
	{
		label: 'All teams',
		icon: () => (
			<Checklist className="border-2 border-current rounded-md px-[1px]" />
		),
		dropDown: () => <span></span>,
		children: [
			{
				to: 'epics',
				label: 'Epics',
				icon: () => <EpicIcon />,
				canAdd: true,
				paddingOffset: 32,
			},
			{
				to: 'stories',
				label: 'Stories',
				icon: () => <BookIcon />,
				canAdd: true,
				paddingOffset: 32,
			},
			{
				to: 'sprints',
				label: 'Sprints',
				icon: () => <SprintIcon />,
				canAdd: true,
				paddingOffset: 32,
			},
		],
	},
];

const SETTINGS_ITEM: NavigationItem = {
	icon: () => <Settings />,
	label: 'Settings',
};

const Sidebar = () => {
	const [expanded, setExpanded] = useState(true);
	const [width, setWidth] = useState('240px');
	const [openSettings, setOpenSettings] = useState(false);

	useEffect(() => {
		setWidth(() => (expanded ? '240px' : '88px'));
	}, [expanded]);

	return (
		<Drawer
			sx={{
				width,
				'& .MuiDrawer-paper': {
					width: width,
					boxSizing: 'border-box',
				},
			}}
			className="transition-all duration-300"
			variant="permanent"
			anchor="left"
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start',
					padding: '20px',
					gap: '4px',
					maxHeight: '79px',
				}}
			>
				{expanded ? (
					<>
						<img src={import.meta.env.BASE_URL + '/logo.svg'} width="140" />
						<NavigateBefore
							className="cursor-pointer rounded-full border-[1px] border-gray-800"
							onClick={() => setExpanded(false)}
						/>
					</>
				) : (
					<img
						src={import.meta.env.BASE_URL + '/mini-logo.svg'}
						height="40"
						className="cursor-pointer"
						onClick={() => setExpanded(true)}
					/>
				)}
			</Box>

			<Divider />
			<List className="sidebar-list">
				{NAVIGATION_ITEMS.map((item) => (
					<SidebarItem item={item} key={item.label} expanded={expanded} />
				))}
			</List>
			{/* <Divider variant="middle" /> */}
			<List
				sx={{
					marginTop: 'auto',
				}}
			>
				<SidebarItem
					item={SETTINGS_ITEM}
					expanded={expanded}
					onClick={() => setOpenSettings(true)}
				/>
			</List>

			<SettingsModal setOpen={setOpenSettings} open={openSettings} />
		</Drawer>
	);
};

export default Sidebar;
