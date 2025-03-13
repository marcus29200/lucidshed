import { useEffect, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControl, MenuItem, Select } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import CreateFeature from './CreateFeature';
import { FeatureListFormProps } from './FeatureDetails';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../router';
import { updateFeature } from '../../api/features';

const FEATURE_LISTS_TABLE_ID = 'feature-lists-table';

const FeaturesList = () => {
	const sortStates = {
		title: true,
		requests: null,
		reach: null,
		impact: null,
		confidence: null,
		effort: null,
		growth: null,
	};
	const initialSorting = getStoredSortState(FEATURE_LISTS_TABLE_ID);
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
	const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);

	const [editingFieldId, setEditingFieldId] = useState('');

	const featureListParam = useParams().new as string;

	const isNewFeatureList = !!featureListParam && featureListParam === 'new';
	const orgId = useParams().orgId as string;

	const featureLists = useLoaderData() as FeatureListFormProps[];

	const navigate = useNavigate();

	useEffect(() => {
		setTimeout(() => {
			setIsCreateSidebarOpen(isNewFeatureList);
		});
	}, [isNewFeatureList]);

	const handleRowClick = (row) => {
		navigate(`/${orgId}/features/${row.id}/requests`);
	};

	const { mutate: patchFeatureList } = useMutation({
		mutationFn: updateFeature,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			setEditingFieldId('');
			await queryClient.invalidateQueries({
				queryKey: ['features', orgId],
			});
			navigate(`/${orgId}/features`);
		},
	});

	const columns: MRT_ColumnDef<FeatureListFormProps>[] = [
		{
			header: 'Feature',
			id: 'title',
			accessorKey: 'title',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Requests',
			id: 'requests',
			accessorKey: 'requests',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Reach',
			id: 'reach',
			accessorKey: 'reach',
			enableColumnActions: false,
			enableColumnFilter: false,

			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();
				return (
					<div
						className="w-full cursor-text"
						onClick={(e) => {
							e.stopPropagation();
							setEditingFieldId(cell.id);
						}}
					>
						{editingFieldId === cell.id ? (
							<>
								<FieldInput
									value={value}
									columnId={cell.column.id}
									row={row.original}
									setEditingFieldId={setEditingFieldId}
									patchFeatureList={patchFeatureList}
									orgId={orgId}
								/>
							</>
						) : (
							value
						)}
					</div>
				);
			},
			muiTableBodyCellProps: {
				onClick: (e) => {
					e.stopPropagation();
					// trigger child to display input
					(e.target as HTMLElement).querySelector('div')?.click();
				},
				sx: {
					'&:hover': {
						cursor: 'text',
					},
				},
			},
		},
		{
			header: 'Impact',
			id: 'impact',
			accessorKey: 'impact',
			enableColumnActions: false,
			enableColumnFilter: false,

			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();
				return (
					<div
						className="w-full cursor-text"
						onClick={(e) => {
							e.stopPropagation();
							setEditingFieldId(cell.id);
						}}
					>
						{editingFieldId === cell.id ? (
							<>
								<FieldInput
									value={value}
									columnId={cell.column.id}
									row={row.original}
									setEditingFieldId={setEditingFieldId}
									patchFeatureList={patchFeatureList}
									orgId={orgId}
								/>
							</>
						) : value ? (
							value
						) : (
							'-'
						)}
					</div>
				);
			},
			muiTableBodyCellProps: {
				onClick: (e) => {
					e.stopPropagation();
					// trigger child to display input
					(e.target as HTMLElement).querySelector('div')?.click();
				},
				sx: {
					'&:hover': {
						cursor: 'text',
					},
				},
			},
		},
		{
			header: 'Confidence',
			id: 'confidence',
			accessorKey: 'confidence',
			enableColumnActions: false,
			enableColumnFilter: false,

			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();
				return (
					<div
						className="w-full cursor-text"
						onClick={(e) => {
							e.stopPropagation();
							setEditingFieldId(cell.id);
						}}
					>
						{editingFieldId === cell.id ? (
							<>
								<FieldInput
									value={value}
									columnId={cell.column.id}
									row={row.original}
									setEditingFieldId={setEditingFieldId}
									patchFeatureList={patchFeatureList}
									orgId={orgId}
								/>
							</>
						) : value ? (
							value
						) : (
							'-'
						)}
					</div>
				);
			},
			muiTableBodyCellProps: {
				onClick: (e) => {
					e.stopPropagation();
					// trigger child to display input
					(e.target as HTMLElement).querySelector('div')?.click();
				},
				sx: {
					'&:hover': {
						cursor: 'text',
					},
				},
			},
		},
		{
			header: 'Effort',
			id: 'effort',
			accessorKey: 'effort',
			enableColumnActions: false,
			enableColumnFilter: false,

			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();
				return (
					<div
						className="w-full cursor-text"
						onClick={(e) => {
							e.stopPropagation();
							setEditingFieldId(cell.id);
						}}
					>
						{editingFieldId === cell.id ? (
							<>
								<FieldInput
									value={value}
									columnId={cell.column.id}
									row={row.original}
									setEditingFieldId={setEditingFieldId}
									patchFeatureList={patchFeatureList}
									orgId={orgId}
								/>
							</>
						) : value ? (
							value
						) : (
							'-'
						)}
					</div>
				);
			},
			muiTableBodyCellProps: {
				onClick: (e) => {
					e.stopPropagation();
					// trigger child to display input
					(e.target as HTMLElement).querySelector('div')?.click();
				},
				sx: {
					'&:hover': {
						cursor: 'text',
					},
				},
			},
		},
		{
			header: 'Growth',
			id: 'growth',
			accessorKey: 'growth',
			enableColumnActions: false,
			enableColumnFilter: false,

			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();
				return (
					<div
						className="w-full cursor-text"
						onClick={(e) => {
							e.stopPropagation();
							setEditingFieldId(cell.id);
						}}
					>
						{editingFieldId === cell.id ? (
							<>
								<FieldInput
									value={value}
									columnId={cell.column.id}
									row={row.original}
									setEditingFieldId={setEditingFieldId}
									patchFeatureList={patchFeatureList}
									orgId={orgId}
								/>
							</>
						) : value ? (
							value
						) : (
							'-'
						)}
					</div>
				);
			},
			muiTableBodyCellProps: {
				onClick: (e) => {
					e.stopPropagation();
					// trigger child to display input
					(e.target as HTMLElement).querySelector('div')?.click();
				},
				sx: {
					'&:hover': {
						cursor: 'text',
					},
				},
			},
		},
	];
	return (
		<div className="relative">
			<Box
				sx={{
					paddingBottom: '12px',
					textAlign: 'left',
				}}
			>
				<Link to={`/${orgId}/features/new`}>
					<Button
						color="primary"
						variant="contained"
						sx={{
							paddingY: '8px',
							paddingX: '36px',
						}}
					>
						New Feature
					</Button>
				</Link>
			</Box>
			<ShedTable
				tableId={FEATURE_LISTS_TABLE_ID}
				columns={columns}
				filteredItems={featureLists}
				setSortingStates={setSortingStates}
				sortingStates={sortingStates}
				actionsEnabled={false}
				handleRowClicked={handleRowClick}
			/>
			<CreateFeature show={isCreateSidebarOpen} />
		</div>
	);
};

type FieldInputProps = {
	columnId: string;
	row: FeatureListFormProps;
	orgId: string;
	value: string;
	patchFeatureList: UseMutateFunction<
		unknown,
		Error,
		{
			orgId: string;
			featureId: number;
			data: unknown;
		},
		unknown
	>;
	setEditingFieldId: (v: string) => void;
};

function FieldInput({
	columnId,
	row,
	orgId,
	patchFeatureList,
	setEditingFieldId,
	value,
}: FieldInputProps) {
	const handleUpdateFeature = (
		featureId: number,
		payload: {
			reach?: number;
			impact?: number;
			confidence?: number;
			effort?: number;
			growth?: number;
			requests: number;
			title: string;
			description: string | null;
		}
	) => {
		patchFeatureList({ orgId, featureId, data: payload });
	};
	return (
		<FormControl sx={{ width: '100%' }}>
			<Select
				variant="outlined"
				size="small"
				margin="dense"
				fullWidth
				defaultValue="1"
				value={value}
				autoFocus
				onChange={(e) => {
					if (!isNaN(+e.target.value)) {
						handleUpdateFeature(row.id, {
							...row,
							[columnId]: +e.target.value,
							requests: row.requests ?? 0,
						});
					}

					setEditingFieldId('');
				}}
				onBlur={() => setEditingFieldId('')}
			>
				{['1', '2', '3', '4', '5'].map((reach) => (
					<MenuItem value={reach} key={reach}>
						{reach}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
}

export default FeaturesList;
