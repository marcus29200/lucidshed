import React from 'react';
import { DashboardItemIcon } from '../../icons/icons';

import { getEpics } from '../../api/epics';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';
import EpicsTable from '../epics/EpicsTable';

const RoadmapView: React.FC = () => {
	const orgId = useParams().orgId as string;
	const { data, isLoading } = useQuery({
		queryKey: ['epics'],
		queryFn: async () => getEpics(orgId),
	});
	const epics = data ?? [];

	return (
		<div className="p-6 bg-white w-full font-poppins h-full">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins text-left">Epics</h2>
					{isLoading && <CircularProgress color="inherit" size={20} />}
				</div>
			</div>

			{/* Container for the cards with horizontal scroll */}
			<EpicsTable epics={epics} checkedField={['id', 'name']} />
		</div>
	);
};

export default RoadmapView;
