import { Box, Divider, Drawer, List } from '@mui/material';
import { useEffect, useState } from 'react';
import {
	BookIcon,
	BoxIcon,
	ChatPlusIcon,
	DashboardIcon,
	DeskAltIcon,
	EpicIcon,
	SendFilledIcon,
	SprintIcon,
} from '../icons/icons';
import { NavigateBefore, NavigateNext, PeopleAlt } from '@mui/icons-material';
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
	iconClassName?: string; // for custom styling of icons
};

const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		to: '',
		label: 'Dashboard',
		icon: () => <DashboardIcon />,
	},
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
	{
		to: 'backlog',
		label: 'Backlog',
		icon: () => <BoxIcon />,
		canAdd: false,
		paddingOffset: 32,
	},
	{
		to: 'product-requests',
		label: 'Product Requests',
		icon: () => <SendFilledIcon />,
		iconClassName: 'pr-1.5 pb-1',
	},
	{
		to: 'feature-requests',
		label: 'Feature Requests',
		icon: () => <ChatPlusIcon />,
		canAdd: true,
		paddingOffset: 32,
	},
	{
		to: 'feature-list',
		label: 'Feature List',
		icon: () => <DeskAltIcon />,
		canAdd: true,
		paddingOffset: 32,
	},
];

const SETTINGS_ITEM: NavigationItem = {
	icon: () => <PeopleAlt />,
	label: 'Users',
};

const Sidebar = () => {
	let _expanded: string | null | boolean = localStorage.getItem(
		'_user_sidebar_expanded'
	);
	_expanded = _expanded === null || _expanded === 'true';
	const [expanded, setExpanded] = useState(_expanded as boolean);
	const [width, setWidth] = useState(_expanded ? '240px' : '88px');
	const [openSettings, setOpenSettings] = useState(false);

	useEffect(() => {
		setWidth(() => (expanded ? '240px' : '88px'));
	}, [expanded]);

	const handleExpanded = (expanded: boolean) => {
		setExpanded(expanded);
		localStorage.setItem('_user_sidebar_expanded', expanded.toString());
	};

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
					justifyContent: 'space-around',
					padding: '20px',
					gap: '4px',
					maxHeight: '79px',
				}}
			>
				{expanded ? (
					<>
						<div
							style={{ aspectRatio: '140/40', width: '140px', height: '40px' }}
						>
							<img
								src={import.meta.env.BASE_URL + '/logo.svg'}
								height="40"
								width="140"
							/>
						</div>
						<NavigateBefore
							className="cursor-pointer rounded-full !h-8 !w-8"
							onClick={() => handleExpanded(false)}
						/>
					</>
				) : (
					<>
						<img
							src={import.meta.env.BASE_URL + '/mini-logo.svg'}
							height="40"
						/>
						<NavigateNext
							className="cursor-pointer rounded-full !h-8 !w-8"
							onClick={() => handleExpanded(true)}
						/>
					</>
				)}
			</Box>

			<Divider />
			<List className="sidebar-list">
				{NAVIGATION_ITEMS.map((item) => (
					<li key={item.label}>
						<SidebarItem item={item} expanded={expanded} />
					</li>
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
