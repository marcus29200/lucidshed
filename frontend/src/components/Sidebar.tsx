import { Box, Divider, Drawer, List } from '@mui/material';
import { useEffect, useState } from 'react';
import { BookIcon, DashboardIcon, DeskAltIcon } from '../icons/icons';
import { NavigateBefore, NavigateNext, PeopleAlt } from '@mui/icons-material';
import SettingsModal from './SettingsDashboard/pages/SettingPage';
import SidebarItem from './SidebarItem';

export type NavigationItem = {
	label: string;
	to?: string;
	icon: () => JSX.Element;
	canAdd?: boolean;
	children?: NavigationItem[];
	paddingOffset?: number; // px
	iconClassName?: string; // for custom styling of icons
	activePaths: string[];
};

const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		to: '',
		label: 'Dashboard',
		icon: () => <DashboardIcon />,
		activePaths: ['dashboard'],
	},
	{
		to: 'stories',
		label: 'Sprint management',
		icon: () => <BookIcon />,
		activePaths: ['stories', 'epics', 'sprints', 'backlog'],
	},
	{
		to: 'feature-requests',
		label: 'Feature management',
		icon: () => <DeskAltIcon />,
		activePaths: ['feature-requests', 'feature-list'],
	},
];

const SETTINGS_ITEM: NavigationItem = {
	icon: () => <PeopleAlt />,
	label: 'Users',
	activePaths: [],
};

const SIDEBAR_WIDTH = '260px';
const SIDEBAR_COLLAPSED_WIDTH = '88px';

const Sidebar = () => {
	let _expanded: string | null | boolean = localStorage.getItem(
		'_user_sidebar_expanded'
	);
	_expanded = _expanded === null || _expanded === 'true';
	const [expanded, setExpanded] = useState(_expanded as boolean);
	const [width, setWidth] = useState(
		_expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH
	);
	const [openSettings, setOpenSettings] = useState(false);

	useEffect(() => {
		setWidth(() => (expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH));
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
			<List className="sidebar-list h-full">
				{NAVIGATION_ITEMS.map((item) => (
					<li key={item.label}>
						<SidebarItem item={item} expanded={expanded} />
					</li>
				))}
			</List>
			{/* <Divider variant="middle" /> */}
			<SidebarItem
				className="!mt-auto"
				item={SETTINGS_ITEM}
				expanded={expanded}
				onClick={() => setOpenSettings(true)}
			/>

			<SettingsModal setOpen={setOpenSettings} open={openSettings} />
		</Drawer>
	);
};

export default Sidebar;
