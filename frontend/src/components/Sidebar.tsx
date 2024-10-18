import {
	Box,
	Divider,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
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
						<img src="/logo.svg" width="140" />
						<NavigateBefore
							className="cursor-pointer rounded-full border-[1px] border-gray-800"
							onClick={() => setExpanded(false)}
						/>
					</>
				) : (
					<img
						src="/mini-logo.svg"
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
				<ListItemButton
					onClick={() => setOpenSettings(true)}
					sx={{
						'& .MuiListItemIcon-root': {
							color: '#242831',
						},
						'& .MuiListItemText-root, & .MuiListItemIcon-root': {
							transition: 'color 0.3s ease',
						},
						'&:hover': {
							backgroundColor: 'transparent',
							'& .MuiListItemText-root, & .MuiListItemIcon-root': {
								color: '#20A224 !important',
							},
						},
					}}
				>
					<ListItemIcon>
						<Settings />
					</ListItemIcon>
					<ListItemText>Admin settings</ListItemText>
				</ListItemButton>
			</List>

			<SettingsModal setOpen={setOpenSettings} open={openSettings} />
		</Drawer>
	);
};

export default Sidebar;
