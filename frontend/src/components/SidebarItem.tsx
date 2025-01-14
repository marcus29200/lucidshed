import { Add } from '@mui/icons-material';
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	IconButton,
	Tooltip,
	tooltipClasses,
} from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { NavigationItem } from './Sidebar';
import { useEnabledRoutes } from '../hooks/enabledRoutes';
import { useEffect } from 'react';

const SidebarItem = ({
	item,
	className = '',
	expanded,
	onClick,
}: {
	item: NavigationItem;
	className?: string;
	expanded: boolean;
	onClick?: () => void;
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

	const { updatePaths } = useEnabledRoutes();

	const isPathActive = (activePaths: string[]) => {
		if (
			(location.pathname.endsWith(`/${orgId}/`) ||
				location.pathname.endsWith(`/${orgId}`)) &&
			activePaths.includes('dashboard')
		) {
			return true;
		}
		return activePaths.some((path) => location.pathname.includes(path));
	};

	const isSelected = isPathActive(item.activePaths);

	useEffect(() => {
		if (isSelected) {
			updatePaths(item.activePaths);
		}
	});
	return (
		<>
			<ListItemButton
				key={item.label}
				selected={isSelected}
				color="primary"
				component={Link}
				onClick={(e) => {
					if (item.to === undefined) {
						e.preventDefault();
						onClick && onClick();
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
					paddingLeft: expanded ? '22px' : '16px !important',
					alignItems: 'center',
					justifyContent: 'center',
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
							top: 'calc(50% - 23px)',
							width: '5px',
							height: '42px',
							backgroundColor: '#20A224',
							borderTopRightRadius: '16px',
							borderBottomRightRadius: '16px',
						},
						'& .MuiListItemText-root, & .MuiListItemIcon-root': {
							color: '#20A224 !important',
							'& span, & svg': {
								fontWeight: '600 !important',
							},
						},
						'& > div': {
							backgroundColor: '#20a2241c',
						},
					},
					'& .MuiListItemIcon-root': {
						color: '#242831',
						minWidth: '24px',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
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
				<div
					className={`flex items-center justify-center gap-4 w-full`}
					style={{
						padding: '8px',
						paddingLeft:
							expanded && item.paddingOffset
								? `${item.paddingOffset}px`
								: '8px',
						borderRadius: '8px',
					}}
				>
					<Tooltip
						title={item.label}
						placement="right"
						PopperProps={{
							sx: {
								[`& .${tooltipClasses.tooltip}`]: { background: '#000' },
							},
						}}
					>
						<ListItemIcon>
							<div className={item.iconClassName ?? ''}>{item.icon()}</div>
						</ListItemIcon>
					</Tooltip>
					{expanded && (
						<>
							<ListItemText
								sx={{
									color: 'black',
									'& .MuiTypography-root': { fontSize: '14px ' },
								}}
							>
								{item.label}
							</ListItemText>
							{item.canAdd && (
								<IconButton
									className="rounded-full !text-neutral-regular !bg-white shadow-md"
									sx={{ zIndex: 10, padding: '4px' }}
									onClick={(e) => addItem(e, item.to as string)}
								>
									<Add />
								</IconButton>
							)}
						</>
					)}
				</div>
			</ListItemButton>
			{item.children &&
				item.children.map((childItem) => (
					<SidebarItem
						key={childItem.label}
						item={childItem}
						expanded={expanded}
					/>
				))}
		</>
	);
};

export default SidebarItem;
