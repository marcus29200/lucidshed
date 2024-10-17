import {
	Box,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookIcon, DashboardIcon, EpicIcon, SprintIcon } from '../icons/icons';
import { Add, Checklist, NavigateBefore, Settings } from '@mui/icons-material';
import SettingsModal from './SettingsDashboard/pages/SettingPage';
import SidebarItem from './SidebarItem';

export type NavigationItem = {
	label: string;
	to?: string;
	icon: () => JSX.Element;
	canAdd?: boolean;
	children?: NavigationItem[];
	dropDown?: () => JSX.Element; // TODO: Implement drop down menu
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
			},
			{
				to: 'stories',
				label: 'Stories',
				icon: () => <BookIcon />,
				canAdd: true,
			},
			{
				to: 'sprints',
				label: 'Sprints',
				icon: () => <SprintIcon />,
				canAdd: true,
			},
		],
	},
];

const Sidebar = () => {
	const { orgId } = useParams();
	const [expanded, setExpanded] = useState(true);
	const [width, setWidth] = useState('240px');
	const navigate = useNavigate();
	const location = useLocation();
	const [openSettings, setOpenSettings] = useState(false);

	useEffect(() => {
		setWidth(() => (expanded ? '240px' : '72px'));
	}, [expanded]);
	const addItem = (e: Event, to: string) => {
		e.preventDefault();
		navigate(`/${orgId}/${to}/new`);
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
					<SidebarItem item={item} key={item.label} />
				))}
			</List>
			<Divider variant="middle" />
			<List>
				<ListItemButton onClick={() => setOpenSettings(true)}>
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
