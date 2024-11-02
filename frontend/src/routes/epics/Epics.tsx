import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import EpicsTable from './EpicsTable';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import FullHeightSection from '../../components/FullHeightSection';
import { getEpics, Priority } from '../../api/epics';
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { KanbanViewIcon, SearchIcon, TableViewIcon } from '../../icons/icons';
import EditFieldsButton from '../../components/EditFieldsButton';
import TableFiltersButton from '../../components/TableFiltersButton';

export const epicsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['epics', orgId],
		queryFn: async () => getEpics(orgId),
	});

export type ApiEpic = {
	id: number;
	title: string;
	description?: string;
	estimated_completion_date: string;
	start_date: string | null;
	organization_id: string;
	priority: Priority;
};

export type Epic = {
	name: string;
	progress: number;
	id: number;
	startDate: string;
	endDate: string;
	priority?: Priority;
	description?: string;
};

export const loader = (_queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No org id provided');
		}
		return getEpics(params.orgId);
		// return await queryClient.ensureQueryData(epicsQuery(params.orgId, params.search))
	};
};
const tableColumnIds = ['name', 'progress', 'id', 'startDate', 'endDate'];

export const Epics = () => {
	const epics: Epic[] = useLoaderData() as Epic[];
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);

	const [editFieldsCheckedItems, setEditFieldsCheckedItems] =
		useState<string[]>(tableColumnIds);

	const [activeIcon, setActiveIcon] = useState('list'); // Default active icon
	const filteredItems = epics.filter((epic) =>
		epic.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filterItems = ['Select All', ...epics.map((epic) => epic.name)];

	const handleIconClick = (icon: string) => {
		setActiveIcon(icon); // Set the clicked icon as active
	};

	return (
		<FullHeightSection className="bg-white p-4 shadow !rounded-lg flex flex-col font-poppins">
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					paddingX: '12px',
					paddingY: '6px',
				}}
			>
				<Typography variant="h6" className="!text-lg !font-semibold">
					Epics
				</Typography>
				<Box className="flex flex-col gap-2">
					<Box
						sx={{
							display: 'flex',
							gap: '8px',
						}}
					>
						{/* Search Bar */}
						<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-2.5 border border-neutral-light rounded-xl">
							<SearchIcon />
							<input
								type="text"
								className="p-1 w-full outline-none"
								placeholder="Search Epic Here"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => {
									// Prevent focus shifting to menu items
									e.stopPropagation();
								}}
							/>
						</div>
						{/* filters and view button */}
						<div className="grid gap-2">
							{/* filters */}
							<TableFiltersButton
								filterItems={filterItems}
								filterCheckedItems={filterCheckedItems}
								setFilterCheckedItems={setFilterCheckedItems}
							/>
							{/* current view */}

							<div className="flex flex-row justify-center items-center gap-x-2 rounded-full border-1 border-gray-300">
								{/* List Icon */}
								<div
									onClick={() => handleIconClick('list')}
									className={`cursor-pointer p-2.5 rounded-full ${
										activeIcon === 'list' ? 'bg-primary' : 'bg-transparent'
									}`}
								>
									<TableViewIcon
										className={
											activeIcon === 'list' ? 'text-white' : 'text-gray-400'
										}
									/>
								</div>

								{/* Dashboard Icon */}
								<div
									onClick={() => handleIconClick('dashboard')}
									className={`cursor-pointer p-2.5 rounded-full ${
										activeIcon === 'dashboard' ? 'bg-primary' : 'bg-transparent'
									}`}
								>
									<KanbanViewIcon
										className={
											activeIcon === 'dashboard'
												? 'text-white'
												: 'text-gray-400'
										}
									/>
								</div>
							</div>
						</div>
						{/* create epic and edit fields button */}
						<div className="grid gap-2">
							{/* Navigation to new epic flow */}
							<Link to="new">
								<Button
									variant="contained"
									sx={{
										paddingX: '70px',
										borderRadius: '10px',
										fontFamily: 'Poppins, sans-serif',
										paddingY: '13px',
										fontSize: '16px',
									}}
								>
									Create Epic
								</Button>
							</Link>
							{/* edit fields */}
							<EditFieldsButton
								fields={tableColumnIds}
								setEditFieldsCheckedItems={setEditFieldsCheckedItems}
								editFieldsCheckedItems={editFieldsCheckedItems}
							/>
						</div>
					</Box>
				</Box>
			</Box>
			<EpicsTable epics={filteredItems} checkedField={editFieldsCheckedItems} />
		</FullHeightSection>
	);
};
