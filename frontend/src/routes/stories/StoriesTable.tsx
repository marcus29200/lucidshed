import { MenuItem, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Story } from './Stories';
import { MRT_Row, MRT_ColumnDef } from 'material-react-table';
import { format } from 'date-fns';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import ShedTable, { TableActions } from '../../components/Table';
import { useMutation } from '@tanstack/react-query';
import {
	CreateStoryPayload,
	deleteStory,
	updateStory,
} from '../../api/stories';
import { copyLink } from '../../api/utils';
import { STORY_PRIORITY_MAPPER } from './stories.model';
import { SelectedMenuOption } from '../../shared/table.model';
import MassEditStoriesDialog from './MassEditStoriesDialog';
import { linkStoryToEpic } from '../../api/epics';
import { toast, Zoom } from 'react-toastify';
import { queryClient } from '../../router';

type StoryDataTableProps = {
	checkedField: string[]; // Array of field names selected by the user
	stories: Story[];
	actionsEnabled?: boolean;
	initialSorting: {
		[key: string]: boolean | null;
	};
	tableId: string;
	parentActions?: TableActions<Story>;
	group?: 'statusLabel' | 'priorityLabel';
};

const StoriesTable = ({
	stories,
	checkedField,
	actionsEnabled = true,
	initialSorting,
	tableId,
	parentActions,
	group,
}: StoryDataTableProps) => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		id: null,
		startDate: null,
		progress: null,
		targetDate: null,
		priority: null,
		status: null,
	};
	if (Object.keys(initialSorting).length) {
		for (const key in sortStates) {
			if (Object.prototype.hasOwnProperty.call(sortStates, key)) {
				if (initialSorting[key] !== undefined) {
					sortStates[key] = initialSorting[key];
				} else {
					sortStates[key] = null;
				}
			}
		}
	}
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>(sortStates);
	const navigate = useNavigate();

	const [openDialog, setOpenDialog] = useState(false);
	const [openStoryFormDialog, setOpenStoryFormDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<Story> | null>(null); // Track which row to delete
	const [rowsToUpdate, setRowsToUpdate] = useState<string[] | null>(null); // Track which row to delete
	const [rowsUpdated, setRowsUpdated] = useState<number>(0); // Track which row to delete
	const location = useLocation();
	const { mutate: patchStory } = useMutation({
		mutationFn: updateStory,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			setRowsUpdated((prev) => prev + 1);
		},
	});

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
			removeStory({ orgId: orgId, storyId: rowToDelete.original.id });
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};
	// State to hold the filtered stories (including searched stories)
	const [filteredStories, setFilteredStories] = useState<Story[]>(stories);
	// group stories by status
	let groupedStories = {};
	if (group) {
		groupedStories = Object.groupBy(filteredStories, (item) => item[group]);
	}

	const handleRowClicked = (story: Story) => {
		navigate(`/${orgId}/stories/${story.id}`);
	};

	const handleClickUpdateSelected = (rows: string[]) => {
		setRowsToUpdate(() => rows);
		setOpenStoryFormDialog(true);
	};
	const selectedRowsActions: SelectedMenuOption[] = [
		{
			label: 'Update selected stories',
			onClick: handleClickUpdateSelected,
		},
	];

	const handleUpdateSelectedStories = async (
		formData: Omit<CreateStoryPayload, 'item_type'>
	) => {
		console.log(rowsToUpdate);

		if (!rowsToUpdate) {
			return;
		}
		const { epicId } = formData;
		setRowsUpdated(0);
		// remove falsy values to avoid override current values
		const cleanData: Partial<CreateStoryPayload> = {};
		for (const field in formData) {
			if (Object.prototype.hasOwnProperty.call(formData, field)) {
				const value = formData[field];
				if (value) {
					cleanData[field] = value;
				}
			}
		}
		if (!Object.keys(cleanData).length) {
			return;
		}
		console.log(cleanData);

		for (let i = 0; i < rowsToUpdate.length; i++) {
			const storyId = +rowsToUpdate[i];
			patchStory({ orgId: orgId as string, storyId: storyId, data: cleanData });
			if (epicId) {
				await linkStoryToEpic({
					orgId: orgId as string,
					storyId,
					epicId,
				});
			}
		}
	};

	useEffect(() => {
		if (rowsUpdated === rowsToUpdate?.length) {
			setRowsToUpdate(null);
			// TODO: make toast a shared function
			toast(
				`${rowsUpdated} ${
					rowsUpdated > 1 ? 'stories' : 'story'
				} updated successfully`,
				{
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					theme: 'light',
					type: 'success',
					transition: Zoom,
				}
			);
			queryClient.invalidateQueries({ queryKey: ['stories'] });
			// updates the tables...
			navigate(location.pathname);
		}
	}, [rowsUpdated]);

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Story>[]>(() => {
		const allColumns: MRT_ColumnDef<Story>[] = [
			{
				accessorKey: 'name',
				id: 'name',
				header: 'Story Name',
				size: 100,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">Story Name</span>,
			},
			{
				accessorKey: 'progress',
				id: 'progress',
				header: 'Progress',
				size: 200,
				enableColumnActions: false,
				filterFn: 'weakEquals',
				filterSelectOptions: [
					{ value: 50, label: 'In Progress' },
					{ value: 100, label: 'Done' },
					{ value: '0', label: 'Not Started' },
				],
				filterVariant: 'select',
				Cell: ({ cell }) => {
					const progress = parseFloat(cell.getValue<string>()); // Assuming the progress is a numeric value in percentage

					return <LinearProgressWithLabel value={progress} />;
				},
				Header: () => <span className="cursor-pointer">Progress</span>,
			},

			{
				accessorKey: 'id',
				id: 'id',
				header: 'Story ID',
				size: 200,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">Story ID</span>,
			},
			{
				accessorKey: 'priority',
				id: 'priority',
				header: 'Priority',
				size: 200,
				enableColumnActions: false,
				filterFn: 'weakEquals',
				filterSelectOptions: [
					{ value: '1', label: 'Critical' },
					{ value: '2', label: 'High' },
					{ value: '3', label: 'Medium' },
					{ value: '4', label: 'Small' },
				],
				filterVariant: 'select',
				Header: () => <span className="cursor-pointer">Priority</span>,
				Cell: ({ cell }) => {
					return STORY_PRIORITY_MAPPER[cell.getValue<string>()] ?? 'Small';
				},
			},

			{
				accessorKey: 'startDate',
				id: 'startDate',
				header: 'Start Date',
				size: 150,
				enableColumnActions: false,
				filterVariant: 'date-range',
				Header: () => <span className="cursor-pointer">Start Date</span>,
				Cell: ({ cell }) => {
					const formattedCompletionDate = cell.getValue<Date>()
						? format(cell.getValue<Date>(), 'MMM dd, yyyy')
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
				filterVariant: 'date-range',
				Header: () => <span className="cursor-pointer">Target Date</span>,
				Cell: ({ cell }) => {
					const formattedCompletionDate = cell.getValue<Date>()
						? format(cell.getValue<string>(), 'MMM dd, yyyy')
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
				copyLink(row.original.id.toString());
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
				const storyId = row.getValue('id');
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
				onConfirm={() => {
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

	if (Object.keys(groupedStories).length) {
		return (
			<>
				{Object.keys(groupedStories).map((key) => {
					const stories = groupedStories[key];
					return (
						<div key={key} className="mt-4">
							<div className="flex gap-4">
								<Typography
									variant="h6"
									textAlign="left"
									padding="10px 0"
									fontWeight="semibold"
								>
									{key}
								</Typography>
							</div>

							<ShedTable
								tableId={tableId}
								columns={columns}
								columFiltersEnabled={true}
								filteredItems={stories}
								setSortingStates={setSortingStates}
								actions={parentActions ?? actions}
								sortingStates={sortingStates}
								handleRowClicked={handleRowClicked}
								actionsEnabled={actionsEnabled}
								selectedRowActions={selectedRowsActions}
								enableRowSelection={true}
							/>
						</div>
					);
				})}
				<MassEditStoriesDialog
					open={openStoryFormDialog}
					onClose={() => setOpenStoryFormDialog(false)}
					onConfirm={(formData) => {
						if (formData) {
							handleUpdateSelectedStories(formData);
						}
						setOpenStoryFormDialog(false);
					}}
				/>
			</>
		);
	}

	return (
		<>
			<ShedTable
				tableId={tableId}
				columns={columns}
				filteredItems={filteredStories}
				setSortingStates={setSortingStates}
				actions={parentActions ?? actions}
				sortingStates={sortingStates}
				handleRowClicked={handleRowClicked}
				actionsEnabled={actionsEnabled}
				selectedRowActions={selectedRowsActions}
				enableRowSelection={true}
			/>
			<MassEditStoriesDialog
				open={openStoryFormDialog}
				onClose={() => setOpenStoryFormDialog(false)}
				onConfirm={(formData) => {
					if (formData) {
						handleUpdateSelectedStories(formData);
					}
					setOpenStoryFormDialog(false);
				}}
			/>
		</>
	);
};

export default StoriesTable;
