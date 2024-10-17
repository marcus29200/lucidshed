import { Add, ExpandMore } from '@mui/icons-material';
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	IconButton,
} from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { NavigationItem } from './Sidebar';

const SidebarItem = ({
	item,
	className = '',
}: {
	item: NavigationItem;
	className?: string;
}) => {
	const { orgId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const addItem = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		to: string
	) => {
		e.preventDefault();
		navigate(`/${orgId}/${to}/new`);
	};
	return (
		<>
			<ListItemButton
				key={item.label}
				selected={
					(!!item.to && location.pathname.includes(item.to)) ||
					(item.to === '' && location.pathname.endsWith(`/${orgId}/`))
				}
				color="primary"
				component={Link}
				onClick={(e) => {
					if (item.to === undefined) {
						e.preventDefault();
					}
				}}
				to={`/${orgId}/${item.to ?? ''}`}
				style={{ textDecoration: 'none', paddingLeft: '22px' }}
				className={className}
				sx={{
					backgroundColor:
						location.pathname === `/${orgId}/${item.to}`
							? '#f0f0f0'
							: undefined,
					position: 'relative',
					'&.Mui-selected': {
						backgroundColor: 'white',
						'&:hover': {
							backgroundColor: 'transparent',
							'& .MuiListItemText-root, & .MuiListItemIcon-root': {
								color: '#20A224af !important',
							},
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
				<ListItemIcon>{item.icon()}</ListItemIcon>
				<ListItemText sx={{ color: 'black' }}>{item.label}</ListItemText>
				{item.canAdd && (
					<IconButton
						className="rounded-full !text-neutral-regular !bg-white shadow-md"
						sx={{ zIndex: 10 }}
						onClick={(e) => addItem(e, item.to as string)}
					>
						<Add />
					</IconButton>
				)}
				{item.dropDown && (
					<IconButton sx={{ zIndex: 10 }} onClick={(e) => e.preventDefault()}>
						<ExpandMore />
					</IconButton>
				)}
			</ListItemButton>
			{item.children &&
				item.children.map((childItem) => (
					<SidebarItem key={childItem.label} item={childItem} />
				))}
		</>
	);
};

export default SidebarItem;
