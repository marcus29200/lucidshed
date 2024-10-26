import { MenuItem } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Story } from './Stories';
import { MRT_Row, MRT_ColumnDef } from 'material-react-table';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/DeleteDialog';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import ShedTable, { TableActions } from '../../components/Table';
import { useMutation } from '@tanstack/react-query';
import { deleteStory } from '../../api/stories';
import { copyLink } from '../../api/utils';
import { STORY_PRIORITY } from './stories.model';
import { queryClient } from '../../router';

type StoryDataTableProps = {
	checkedField: string[]; // Array of field names selected by the user
	stories: Story[];
	actionsEnabled?: boolean;
};
const StoriesTable = ({
	stories,
	checkedField,
	actionsEnabled = true,
}: StoryDataTableProps) => {
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>({
		name: true, // Set to true to start with descending order
		storyId: true,
		startDate: true,
		progress: true,
		targetDate: true,
		priority: true,
		status: true,
	});
	const navigate = useNavigate();

	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<Story> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<Story>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	const orgId = useParams().orgId;

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredStories(stories);
	}, [stories]);
	const { mutate: removeStory } = useMutation({
		mutationFn: deleteStory,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['stories'] });
			navigate(`/${orgId}/stories`);
			setOpenDialog(false); // Close the dialog after successful deletion
		},
	});
	const handleDelete = () => {
		if (rowToDelete) {
			removeStory({ orgId: orgId, storyId: rowToDelete.original.storyId });
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};
	// State to hold the filtered stories (including searched stories)
	const [filteredStories, setFilteredStories] = useState<Story[]>(stories);

	const handleSortingChange = (id: string) => {
		setSortingStates((prev) => {
			const currentOrder = prev[id];

			const newSortingState = Object.keys(prev).reduce((acc, key) => {
				if (key === id) {
					acc[key] =
						currentOrder === null || currentOrder === false ? true : false;
				} else {
					acc[key] = null;
				}
				return acc;
			}, {} as typeof sortingStates);

			return newSortingState;
		});
	};

	const handleRowClicked = (story: Story) => {
		navigate(`./${story.storyId}`, { relative: 'path' });
	};

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Story>[]>(() => {
		const allColumns: MRT_ColumnDef<Story>[] = [
			{
				accessorKey: 'name',
				id: 'name',
				header: 'Story Name',
				size: 100,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('name')}
					>
						Story Name
					</span>
				),
			},
			{
				accessorKey: 'progress',
				id: 'progress',
				header: 'Progress',
				size: 200,
				enableColumnActions: false,
				Cell: ({ cell }) => {
					const progress = parseFloat(cell.getValue<string>()); // Assuming the progress is a numeric value in percentage

					return <LinearProgressWithLabel value={progress} />;
				},
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('progress')}
					>
						Progress
					</span>
				),
			},

			{
				accessorKey: 'storyId',
				id: 'storyId',
				header: 'Story ID',
				size: 200,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('storyId')}
					>
						Story ID
					</span>
				),
			},
			{
				accessorKey: 'priority',
				id: 'priority',
				header: 'Priority',
				size: 200,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('priority')}
					>
						Priority
					</span>
				),
				Cell: ({ cell }) => {
					return STORY_PRIORITY[cell.getValue<string>()] ?? 'Small';
				},
			},

			{
				accessorKey: 'startDate',
				id: 'startDate',
				header: 'Start Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('startDate')}
					>
						Start Date
					</span>
				),
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? format(new Date(cell.getValue<string>()), 'MMM dd, yyyy')
							: '-';
					return formattedCompletionDate;
				},
			},
			{
				accessorKey: 'targetDate',
				id: 'targetDate',
				header: 'Target Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('targetDate')}
					>
						Target Date
					</span>
				),
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? format(new Date(cell.getValue<string>()), 'MMM dd, yyyy')
							: '-';
					return formattedCompletionDate;
				},
			},
		];

		return allColumns.filter((column) =>
			checkedField.includes(column.accessorKey as string)
		);
	}, [checkedField]);

	const actions: TableActions<Story> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.id}-0`}
			onClick={() => {
				closeMenu();
				copyLink(row.original.storyId.toString());
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Copy Link
		</MenuItem>,
		<MenuItem
			key={`${row.id}-1`}
			onClick={() => {
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			{/* TODO */}
			Duplicate Story
		</MenuItem>,
		<MenuItem
			key={`${row.id}-2`}
			onClick={() => {
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Assign To Epic
		</MenuItem>,
		<MenuItem
			key={`${row.id}-3`}
			onClick={() => {
				// Access the storyId from the row data
				const storyId = row.getValue('storyId');
				navigate(`./${storyId}`, { relative: 'path' });
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Open Story
		</MenuItem>,
		<div key={`${row.id}-4`}>
			<MenuItem
				onClick={(e) => {
					e.stopPropagation(); // Ensure the menu doesn't close immediately
					handleOpenDialog(row); // Open the dialog
				}}
				sx={{
					px: 6,
					pt: 1,
					borderTop: '1px solid #E3E7EB',
					color: 'red ',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				Delete
			</MenuItem>
			{/* Dialog box */}
			<ConfirmationDialog
				open={openDialog}
				onClose={handleCloseDialog}
				onDelete={() => {
					closeMenu();
					handleDelete();
				}}
				children={
					<span className="text-neutral-regular text-base">
						Are you sure you want to delete this story? This action cannot be
						undone and will permanently remove all associated tasks, comments,
						and attachments. Please confirm if you wish to proceed.
					</span>
				}
			/>
		</div>,
	];

	return (
		<ShedTable
			columns={columns}
			filteredItems={filteredStories}
			setSortingStates={setSortingStates}
			actions={actions}
			sortingStates={sortingStates}
			handleRowClicked={handleRowClicked}
			actionsEnabled={actionsEnabled}
		/>
	);
};

export default StoriesTable;
