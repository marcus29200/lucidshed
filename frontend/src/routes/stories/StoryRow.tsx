import { TableCell, TableRow, IconButton, MenuItem, Menu } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStory } from '../../api/stories';
import { Story } from './Stories';
import { ConfirmationDialog } from '../../components/DeleteDialog';

// TODO: add typing for epic
const StoryRow = ({
	story,
	checkedField,
}: {
	story: Story;
	checkedField: string[];
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const navigate = useNavigate();
	const params = useParams();
	const open = Boolean(anchorEl);
	const queryClient = useQueryClient();
	const { mutate: removeStory } = useMutation({
		mutationFn: deleteStory,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['stories'] });
			navigate(`/${params.orgId}/stories`);
		},
	});

	const handleClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const copyLink = async () => {
		await navigator.clipboard.writeText(
			`${window.location.href}/${story.storyId}`
		);
	};

	const deleteItem = () => {
		removeStory({ orgId: params.orgId, storyId: story.storyId });
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
	};

	const formattedCompletionDate = story.targetDate
		? format(new Date(story.targetDate), 'MMM dd, yyyy')
		: null;
	const formattedStartDate = story.startDate
		? format(new Date(story.startDate), 'MMM dd, yyyy')
		: null;
	let progressColor = '';

	if (story.progress === 100) {
		progressColor = '#20A224'; // Green for 100% completion
	} else if (story.progress > 70) {
		progressColor = '#8bc34a'; // Light green for progress > 70%
	} else if (story.progress > 40) {
		progressColor = '#E5B710'; // Yellow for progress between 40% and 70%
	} else {
		progressColor = '#FCD9E0'; // Red for progress < 40%
	}
	return (
		<>
			<TableRow
				sx={{ cursor: 'pointer' }}
				hover={true}
				onClick={() => navigate(`./${story.storyId}`, { relative: 'path' })}
			>
				{checkedField.includes('name') && <TableCell>{story.name}</TableCell>}
				{checkedField.includes('progress') && (
					<TableCell>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div
								style={{
									height: '8px', // thinner height
									width: '65%',
									backgroundColor: '#e0e0e0', // Light grey for the background bar
									borderRadius: '20px',

									overflow: 'hidden',
									marginRight: '8px', // Spacing between the bar and the percentage
								}}
							>
								<div
									style={{
										width: `${story.progress}%`,
										backgroundColor: progressColor,
										height: '100%',
									}}
								></div>
							</div>
							<span
								className=" w-[60%] text-end"
								style={{ color: '#9e9e9e', fontSize: '0.875rem' }}
							>
								{story.progress}%
							</span>
						</div>
					</TableCell>
				)}
				{checkedField.includes('storyId') && (
					<TableCell>{story.storyId}</TableCell>
				)}
				{checkedField.includes('startDate') && (
					<TableCell>{formattedStartDate}</TableCell>
				)}
				{checkedField.includes('targetDate') && (
					<TableCell>{formattedCompletionDate}</TableCell>
				)}
				<TableCell>
					<IconButton onClick={handleClick}>
						<MoreHorizIcon />
					</IconButton>
				</TableCell>
			</TableRow>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				slotProps={{
					paper: {
						sx: {
							width: '208px',
							minWidth: '208px',
							borderRadius: '12px',
							boxShadow: '0px 0px 4px 0px #00000040',
						},
					},
				}}
			>
				<MenuItem onClick={copyLink}>Copy Link</MenuItem>
				{/* TODO */}
				<MenuItem>Duplicate Story</MenuItem>
				{/* TODO */}
				<MenuItem>Assign To Epic</MenuItem>
				<MenuItem
					onClick={() => navigate(`./${story.storyId}`, { relative: 'path' })}
				>
					Open Story
				</MenuItem>
				<MenuItem
					onClick={() => setOpenDialog(true)}
					sx={{
						color: 'red',
						borderTop: '1px solid #ccc',
						':hover': { color: 'black' },
						transition: 'color 0.2s ease',
					}}
				>
					Delete
				</MenuItem>
			</Menu>
			{/* Dialog box */}
			<ConfirmationDialog
				open={openDialog}
				onClose={handleCloseDialog}
				onDelete={deleteItem}
				children={
					<span className="text-neutral-regular text-base">
						Are you sure you want to delete this story? This action cannot be
						undone and will permanently remove all associated tasks, comments,
						and attachments. Please confirm if you wish to proceed.
					</span>
				}
			/>
		</>
	);
};

export default StoryRow;
