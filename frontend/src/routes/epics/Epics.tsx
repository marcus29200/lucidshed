import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import EpicsTable from './EpicsTable';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import FullHeightSection from '../../components/FullHeightSection';
import { getEpics, Priority } from '../../api/epics';
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { SearchIcon } from '../../icons/icons';

export const epicsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['epics', orgId],
		queryFn: async () => getEpics(orgId),
	});

export type ApiEpic = {
	id: string;
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
	id: string;
	startDate: string;
	endDate: string;
	priority: Priority;
	description?: string;
};

export const epicsLoader = (_queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No org id provided');
		}
		return getEpics(params.orgId);
		// return await queryClient.ensureQueryData(epicsQuery(params.orgId, params.search))
	};
};
const editFieldsCheckedItems = [
	'name',
	'progress',
	'id',
	'startDate',
	'endDate',
];

export const Epics = () => {
	const epics: Epic[] = useLoaderData() as Epic[];
	const [searchTerm, setSearchTerm] = useState('');

	const filteredItems = epics.filter((epic) =>
		epic.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<FullHeightSection className="bg-white p-4 shadow !rounded-lg flex flex-col font-poppins">
			<Box
				sx={{
					paddingBottom: '32px',
				}}
			>
				<Typography variant="h6" textAlign="left">
					Epics
				</Typography>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '8px',
					}}
				>
					{/* Search Bar */}
					<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-1 border border-neutral-light rounded-xl">
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

					<div className="flex gap-2">
						{/* Navigation to new story flow */}
						<Link to="new">
							<Button
								variant="contained"
								sx={{
									paddingX: '16px',
									borderRadius: '10px',
									fontFamily: 'Poppins, sans-serif',
									paddingY: '8px',
									fontSize: '16px',
								}}
							>
								Create Epic
							</Button>
						</Link>
					</div>
				</Box>
			</Box>

			<EpicsTable epics={filteredItems} checkedField={editFieldsCheckedItems} />
		</FullHeightSection>
	);
};
