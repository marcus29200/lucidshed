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
import { Add, NavigateBefore, Settings } from '@mui/icons-material';
import SettingsModal from './SettingsDashboard/pages/SettingPage';

const NAVIGATION_ITEMS = [
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
					<ListItemButton
						key={item.to}
						selected={
							(location.pathname.includes(item.to) && item.to != '') ||
							(item.to === '' && location.pathname.endsWith(`/${orgId}/`))
						}
						color="primary"
						component={Link}
						to={`/${orgId}/${item.to}`}
						style={{ textDecoration: 'none', paddingLeft: '22px' }}
						sx={{
							backgroundColor:
								location.pathname === `/${orgId}/${item.to}`
									? '#f0f0f0'
									: undefined,
							position: 'relative',
							'&.Mui-selected': {
								backgroundColor: 'white',
								'&:hover': {
									backgroundColor: '#20A2240f',
								},
								'&::before': {
									content: '""',
									position: 'absolute',
									left: 0,
									top: 'calc(50% - 20px)',
									width: '5px',
									height: '40px',
									backgroundColor: '#20A224',
									borderTopRightRadius: '16px',
									borderBottomRightRadius: '16px',
								},
								'& .MuiListItemText-root, & .MuiListItemIcon-root': {
									color: '#20A224 !important',
								},
							},
							'& .MuiListItemIcon-root': {
								color: '#242831',
							},
						}}
					>
						<ListItemIcon>{item.icon()}</ListItemIcon>
						<ListItemText sx={{ color: 'black' }}>{item.label}</ListItemText>
						{item.canAdd ? (
							<IconButton
								className="rounded-full !text-neutral-regular !bg-white shadow-md"
								sx={{ zIndex: 10 }}
								onClick={(e) => addItem(e, item.to)}
							>
								<Add />
							</IconButton>
						) : null}
					</ListItemButton>
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
